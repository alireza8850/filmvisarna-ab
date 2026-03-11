import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegistrationPage from "../../src/pages/RegistrationPage";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("RegistrationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("renders registration form correctly", () => {
    render(
      <MemoryRouter>
        <RegistrationPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Bli Medlem Hos Oss")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Skriv in ditt förnamn")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Skriv in ditt efternamn")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Skriv in din E-post adress")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0712345678")).toBeInTheDocument();
  });

  it("shows validation error for short password", async () => {
    render(
      <MemoryRouter>
        <RegistrationPage />
      </MemoryRouter>
    );
    const passwordInput = screen.getAllByPlaceholderText("********")[0];
    fireEvent.change(passwordInput, { target: { value: "short" } });
    fireEvent.blur(passwordInput);
    expect(screen.getByText("Lösenordet måste vara minst 8 tecken.")).toBeInTheDocument();
  });

  it("shows validation error when passwords do not match", async () => {
    render(
      <MemoryRouter>
        <RegistrationPage />
      </MemoryRouter>
    );
    const passwordInputs = screen.getAllByPlaceholderText("********");
    fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
    fireEvent.change(passwordInputs[1], { target: { value: "different123" } });
    fireEvent.blur(passwordInputs[1]);
    expect(screen.getByText("Lösenorden matchar inte.")).toBeInTheDocument();
  });

  it("calls registration API and navigates on success", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <MemoryRouter>
        <RegistrationPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Skriv in ditt förnamn"), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText("Skriv in ditt efternamn"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Skriv in din E-post adress"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("0712345678"), { target: { value: "123456789" } });
    const passwordInputs = screen.getAllByPlaceholderText("********");
    fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
    fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: "Registrera" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/register", expect.any(Object));
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
