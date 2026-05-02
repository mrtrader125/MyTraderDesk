import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// 🚨 SAFEGUARD 1: Force Next.js to skip this file during the build process
export const dynamic = 'force-dynamic';

// Use Service Role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const { applicantId, email, name, action } = await req.json();

    if (action === 'reject') {
      await supabase.from('applicants').update({ status: 'rejected' }).eq('id', applicantId);
      return NextResponse.json({ success: true, message: 'Applicant rejected.' });
    }

    if (action === 'approve') {
      const resendKey = process.env.RESEND_API_KEY || 're_dummy_key_to_prevent_build_crash';
      const resend = new Resend(resendKey);
      
      // 1. Generate a secure, unique cryptographic token
      const inviteToken = crypto.randomUUID();
      
      // 2. Update the applicant's status AND save their unique token
      await supabase
        .from('applicants')
        .update({ 
          status: 'approved',
          invite_token: inviteToken 
        })
        .eq('id', applicantId);

      // 3. Attach the token to the URL to create the Ghost Portal link
      const signupUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/initialize?token=${inviteToken}`; 
      
      // 4. Transmit the email
      const emailResponse = await resend.emails.send({
        from: 'MyTraderDesk <noreply@mytraderdesk.com>',
        to: email,
        subject: 'Terminal Access Granted: MyTraderDesk',
        html: `
          <div style="font-family: monospace; color: #111; max-width: 600px; margin: 0 auto;">
            <p>${name},</p>
            <p>Your operational diagnostic has been reviewed. You meet the criteria for the founding cohort.</p>
            <p><strong>Terminal access has been granted.</strong></p>
            <p>Your clearance has been cryptographically signed. Use the secure link below to initialize your profile and establish your operational protocol.</p>
            <br/>
            <a href="${signupUrl}" style="background-color: #111; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase;">Initialize Terminal Access</a>
            <br/><br/>
            <p>— Desk Operations</p>
          </div>
        `,
      });

      // 🚨 IF RESEND FAILS, FORCE AN ERROR TO THE FRONTEND
      if (emailResponse.error) {
        console.error('RESEND REJECTION:', emailResponse.error);
        return NextResponse.json(
          { success: false, error: `Resend Blocked Email: ${emailResponse.error.message}` }, 
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, message: 'Applicant approved and clearance token transmitted.' });
    }

  } catch (error) {
    console.error('Admin Action Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process application.' }, { status: 500 });
  }
}
