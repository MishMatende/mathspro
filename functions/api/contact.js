import { Resend } from "resend";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const { name, email, whatsapp, message } = await request.json();

    if (!name || !email || !whatsapp || !message) {
      return Response.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 },
      );
    }

    const resend = new Resend(env.RESEND_API_KEY);

    // ========================================
    // EMAIL TO MATHSPRO
    // ========================================

    const adminEmail = await resend.emails.send({
      from: "MathsPro <info@mathspro.academy>",
      to: ["mishaelmatende@gmail.com"],
      replyTo: email,
      subject: `📩 New Contact Form Submission - ${name}`,
      html: `
      <div style="
        font-family: Inter, Arial, sans-serif;
        background:#f8fafc;
        padding:40px 20px;
      ">
        <div style="
          max-width:650px;
          margin:auto;
          background:white;
          border-radius:20px;
          overflow:hidden;
          box-shadow:0 10px 30px rgba(0,0,0,0.08);
        ">
          
          <div style="
            background:#f97316;
            padding:30px;
            text-align:center;
            color:white;
          ">
            <h1 style="
              margin:0;
              font-size:28px;
            ">
              MathsPro Academy
            </h1>

            <p style="
              margin-top:8px;
              opacity:0.9;
            ">
              New Contact Form Submission
            </p>
          </div>

          <div style="padding:30px;">
            
            <div style="
              background:#fff7ed;
              border:1px solid #fdba74;
              border-radius:14px;
              padding:18px;
              margin-bottom:24px;
            ">
              <strong style="color:#ea580c;">
                A visitor has submitted the contact form.
              </strong>
            </div>

            <table style="
              width:100%;
              border-collapse:collapse;
            ">
              <tr>
                <td style="
                  padding:12px 0;
                  color:#64748b;
                  font-weight:600;
                  width:140px;
                ">
                  Name
                </td>

                <td style="
                  padding:12px 0;
                  color:#0f172a;
                ">
                  ${name}
                </td>
              </tr>

              <tr>
                <td style="
                  padding:12px 0;
                  color:#64748b;
                  font-weight:600;
                ">
                  Email
                </td>

                <td style="
                  padding:12px 0;
                ">
                  <a href="mailto:${email}">
                    ${email}
                  </a>
                </td>
              </tr>

              <tr>
                <td style="
                  padding:12px 0;
                  color:#64748b;
                  font-weight:600;
                ">
                  WhatsApp
                </td>

                <td style="
                  padding:12px 0;
                ">
                  ${whatsapp}
                </td>
              </tr>
            </table>

            <div style="
              margin-top:28px;
            ">
              <h3 style="
                color:#0f172a;
                margin-bottom:12px;
              ">
                Message
              </h3>

              <div style="
                background:#f8fafc;
                border:1px solid #e2e8f0;
                border-radius:14px;
                padding:20px;
                color:#334155;
                line-height:1.8;
              ">
                ${message.replace(/\n/g, "<br>")}
              </div>
            </div>

            <div style="
              margin-top:30px;
              text-align:center;
            ">
              <a
                href="mailto:${email}"
                style="
                  display:inline-block;
                  background:#f97316;
                  color:white;
                  text-decoration:none;
                  padding:14px 24px;
                  border-radius:12px;
                  font-weight:600;
                "
              >
                Reply to ${name}
              </a>
            </div>
          </div>

          <div style="
            padding:20px;
            text-align:center;
            color:#94a3b8;
            font-size:13px;
            border-top:1px solid #e2e8f0;
          ">
            Sent from the MathsPro Academy website contact form.
          </div>

        </div>
      </div>
      `,
    });

    // ========================================
    // AUTO RESPONSE TO USER
    // ========================================

    const userEmail = await resend.emails.send({
      from: "MathsPro <info@mathspro.academy>",
      to: email,
      subject: "We've received your message",
      html: `
      <div style="
        font-family: Inter, Arial, sans-serif;
        background:#f8fafc;
        padding:40px 20px;
      ">
        <div style="
          max-width:600px;
          margin:auto;
          background:white;
          border-radius:20px;
          overflow:hidden;
          box-shadow:0 10px 30px rgba(0,0,0,0.08);
        ">
          
          <div style="
            background:#f97316;
            color:white;
            text-align:center;
            padding:30px;
          ">
            <h1 style="margin:0;">
              MathsPro Academy
            </h1>

            <p style="
              margin-top:8px;
              opacity:0.9;
            ">
              Message Received
            </p>
          </div>

          <div style="padding:30px;">

            <h2 style="
              color:#0f172a;
              margin-top:0;
            ">
              Hi ${name},
            </h2>

            <p style="
              color:#475569;
              line-height:1.8;
            ">
              Thank you for reaching out to MathsPro Academy.
            </p>

            <p style="
              color:#475569;
              line-height:1.8;
            ">
              We have successfully received your message and a member of our team will respond as soon as possible.
            </p>

            <div style="
              margin:24px 0;
              background:#fff7ed;
              border:1px solid #fdba74;
              border-radius:14px;
              padding:20px;
            ">
              <strong>Your Message</strong>

              <p style="
                margin-top:10px;
                color:#475569;
                line-height:1.8;
              ">
                ${message.replace(/\n/g, "<br>")}
              </p>
            </div>

            <p style="
              color:#475569;
              line-height:1.8;
            ">
              If your enquiry is urgent, feel free to contact us directly via WhatsApp.
            </p>

            <p style="
              margin-top:30px;
              color:#0f172a;
            ">
              Regards,<br/>
              <strong>MathsPro Academy Team</strong>
            </p>

          </div>

          <div style="
            border-top:1px solid #e2e8f0;
            padding:20px;
            text-align:center;
            color:#94a3b8;
            font-size:13px;
          ">
            MathsPro Academy • Building Mathematical Confidence
          </div>

        </div>
      </div>
      `,
    });

    return Response.json({
      success: true,
      adminEmail,
      userEmail,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Failed to send message",
      },
      {
        status: 500,
      },
    );
  }
}
