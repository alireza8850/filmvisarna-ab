import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../../src/pages/LoginPage";
import { useUser } from "../../src/utils/UserContext";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock hooks
vi.mock("../../src/utils/UserContext", () => ({
  useUser: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginPage", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUser as any).mockReturnValue({
      user: null,
      login: mockLogin,
      logout: vi.fn(),
      checkLoginStatus: vi.fn(),
    });
    global.fetch = vi.fn();
  });

  it("renders login form correctly", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Logga In")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Skriv in din e-post adress")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("********")).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    const emailInput = screen.getByPlaceholderText("Skriv in din e-post adress");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.blur(emailInput);
    expect(screen.getByText("Ange en giltig e-post adress.")).toBeInTheDocument();
  });

  it("shows validation error for short password", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    const passwordInput = screen.getByPlaceholderText("********");
    fireEvent.change(passwordInput, { target: { value: "123" } });
    fireEvent.blur(passwordInput);
    expect(screen.getByText("Lösenordet måste vara minst 8 tecken.")).toBeInTheDocument();
  });

  it("calls login API and navigates on success", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, firstName: "Test", lastName: "User", role: "user" }),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Skriv in din e-post adress"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Logga in" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/login", expect.any(Object));
      expect(mockLogin).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows server error on failed login", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: "Fel e-post eller lösenord." }),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Skriv in din e-post adress"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Logga in" }));

    await waitFor(() => {
      expect(screen.getByText("Fel e-post eller lösenord.")).toBeInTheDocument();
    });
  });
});
