namespace WebApp;

public static class ContactRoutes
{
    public static void Start()
    {
        // POST /api/contact
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

                //Validation 
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

                //  1) Save to database 
                var insertSql = @"
                    INSERT INTO contact_messages (name, email, phone, subject, message)
                    VALUES (@name, @email, @phone, @subject, @message)
                ";
                SQLQueryOne(insertSql, new { name, email, phone, subject, message }, context);

                // 2) Build HTML email body
                string htmlBody = $@"
                    <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"">
                        <h2 style=""color: #1a1a2e; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;"">
                            Nytt kontaktmeddelande – Filmvisarna AB
                        </h2>
                        <table style=""width:100%; border-collapse:collapse; margin-top:16px;"">
                            <tr>
                                <td style=""padding:8px 12px; background:#f9f9f9; font-weight:bold; width:120px;"">Namn</td>
                                <td style=""padding:8px 12px;"">{name}</td>
                            </tr>
                            <tr>
                                <td style=""padding:8px 12px; background:#f9f9f9; font-weight:bold;"">E-post</td>
                                <td style=""padding:8px 12px;""><a href=""mailto:{email}"">{email}</a></td>
                            </tr>
                            <tr>
                                <td style=""padding:8px 12px; background:#f9f9f9; font-weight:bold;"">Telefon</td>
                                <td style=""padding:8px 12px;"">{(string.IsNullOrWhiteSpace(phone) ? "–" : phone)}</td>
                            </tr>
                            <tr>
                                <td style=""padding:8px 12px; background:#f9f9f9; font-weight:bold;"">Ämne</td>
                                <td style=""padding:8px 12px;"">{(string.IsNullOrWhiteSpace(subject) ? "–" : subject)}</td>
                            </tr>
                        </table>

                        <h3 style=""margin-top:24px; color:#1a1a2e;"">Meddelande:</h3>
                        <div style=""background:#f9f9f9; padding:16px; border-left:3px solid #f59e0b; white-space:pre-wrap;"">
                            {message}
                        </div>

                        <p style=""margin-top:24px; font-size:12px; color:#888;"">
                            Skickat via kontaktformuläret på filmvisarna.se &nbsp;|&nbsp;
                            {DateTime.Now:yyyy-MM-dd HH:mm}
                        </p>
                    </div>
                ";

                //  3) Send email to Filmvisarna inbox 
                EmailService.SendEmail(
                    to:      "fatima738086@gmail.com",   // your inbox
                    subject: $"[Kontakta oss] {(string.IsNullOrWhiteSpace(subject) ? "Nytt meddelande" : subject)}",
                    body:    htmlBody
                );

                //  4) (Optional) send auto-reply to the user 
                string autoReply = $@"
                    <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"">
                        <h2 style=""color: #1a1a2e;"">Tack för ditt meddelande, {name}!</h2>
                        <p>Vi har tagit emot ditt meddelande och återkommer till dig inom 24 timmar.</p>
                        <p><strong>Ditt ärende:</strong> {(string.IsNullOrWhiteSpace(subject) ? "–" : subject)}</p>
                        <hr style=""border:none; border-top:1px solid #eee; margin:24px 0;""/>
                        <p style=""font-size:12px; color:#888;"">
                            Med vänliga hälsningar<br/>
                            Filmvisarna AB<br/>
                            fatima738086@gmail.com
                            info@filmvisarna.se
                        </p>
                    </div>
                ";

                try
                {
                    EmailService.SendEmail(
                        to:      email,
                        subject: "Vi har tagit emot ditt meddelande – Filmvisarna AB",
                        body:    autoReply
                    );
                }
                catch (Exception ex)
                {
                    // Auto-reply failure is non-critical – log and continue
                    Console.WriteLine($"Auto-reply kunde inte skickas: {ex.Message}");
                }

                context.Response.StatusCode = 201;
                return RestResult.Parse(context, new
                {
                    success = true,
                    message = "Ditt meddelande har skickats!"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Contact form error: {ex.Message}");
                context.Response.StatusCode = 500;
                return RestResult.Parse(context, new { error = ex.Message });
            }
        });
    }
}