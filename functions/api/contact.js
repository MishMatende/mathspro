import { Resend } from "resend";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const body = await request.json();

    const { name, email, whatsapp, message } = body;

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

    await resend.emails.send({
      from: "MathsPro <info@mathspro.academy>",
      to: ["mishaelmatende@gmail.com"],
      replyTo: email,
      subject: `New Contact Form Submission - ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>

        <hr>

        <p>${message}</p>
      `,
    });

    return Response.json({
      success: true,
      message: "Message sent successfully",
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
