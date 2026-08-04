import { NextResponse } from "next/server";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
}).strict();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid form data" },
        { status: 400 }
      );
    }

    const { name, email, message } = parsed.data;

    // Attempt to send via Resend if configured, otherwise log and succeed
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Agency Elite <onboarding@resend.dev>",
            to: ["israelwerku@gmail.com"],
            subject: `[Agency Elite Contact] Message from ${name}`,
            html: `
              <div style="font-family: system-ui, sans-serif; max-width: 600px;">
                <h2 style="color: #800020;">New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <hr style="border: 1px solid #eee; margin: 16px 0;" />
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
            `,
          }),
        });

        if (!resendRes.ok) {
          const errData = await resendRes.json().catch(() => ({}));
          console.error("[CONTACT] Resend API error:", errData);
        }
      } catch (emailErr) {
        console.error("[CONTACT] Email send failed:", emailErr);
      }
    } else {
      // Log to console when Resend is not configured (dev mode)
      console.log("[CONTACT_FORM] New submission:", { name, email, message: message.substring(0, 100) + "..." });
    }

    return NextResponse.json({ success: true, message: "Message sent successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("[CONTACT] Unhandled error:", err.message);
    return NextResponse.json({ error: "Failed to process your message" }, { status: 500 });
  }
}
