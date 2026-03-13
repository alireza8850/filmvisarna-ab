namespace WebApp;

public static class ContactRoutes
{
    public static void Start()
    {
        App.MapPost("/api/contact", (HttpContext context, JsonElement bodyJson) =>
        {
            try
            {
                var body = JSON.Parse(bodyJson.ToString());

                string name    = (string)(body.name    ?? "");
                string email   = (string)(body.email   ?? "");
                string phone   = (string)(body.phone   ?? "");
                string subject = (string)(body.subject ?? "");
                string message = (string)(body.message ?? "");

                if (string.IsNullOrWhiteSpace(name) ||
                    string.IsNullOrWhiteSpace(email) ||
                    string.IsNullOrWhiteSpace(message))
                {
                    context.Response.StatusCode = 400;
                    return RestResult.Parse(context, new
                    {
                        error = "Namn, e-postadress och meddelande är obligatoriska."
                    });
                }

                // Save to database
                SQLQueryOne(
                    @"INSERT INTO contact_messages (name, email, phone, subject, message)
                      VALUES (@name, @email, @phone, @subject, @message)",
                    new { name, email, phone, subject, message },
                    context
                );

                // Send email to Filmvisarna inbox
                string htmlBody = $@"
                    <h2>Nytt kontaktmeddelande</h2>
                    <p><strong>Namn:</strong> {name}</p>
                    <p><strong>E-post:</strong> {email}</p>
                    <p><strong>Telefon:</strong> {(string.IsNullOrWhiteSpace(phone) ? "–" : phone)}</p>
                    <p><strong>Ämne:</strong> {(string.IsNullOrWhiteSpace(subject) ? "–" : subject)}</p>
                    <hr/>
                    <p><strong>Meddelande:</strong></p>
                    <p>{message}</p>
                ";

                EmailService.SendEmail(
                    "fatima738086@gmail.com",
                    $"[Kontakta oss] {(string.IsNullOrWhiteSpace(subject) ? "Nytt meddelande" : subject)}",
                    htmlBody
                );

                context.Response.StatusCode = 201;
                return RestResult.Parse(context, new { success = true });
            }
            catch (Exception ex)
            {
                context.Response.StatusCode = 500;
                return RestResult.Parse(context, new { error = ex.Message });
            }
        });
    }
}