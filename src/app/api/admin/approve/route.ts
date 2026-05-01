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
      // 🚨 SAFEGUARD 2: Provide a dummy key if the real one is missing during compilation
      const resendKey = process.env.RESEND_API_KEY || 're_dummy_key_to_prevent_build_crash';
      const resend = new Resend(resendKey);
      
      // Update the applicant's status to approved
      await supabase.from('applicants').update({ status: 'approved' }).eq('id', applicantId);

      // Transmit the email pointing to your standard signup page
      const signupUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/signup`; 
      
      await resend.emails.send({
        from: 'Desk Operations <ops@yourdomain.com>', // MUST BE YOUR VERIFIED DOMAIN
        to: email,
        subject: 'Terminal Access Granted: MyTraderDesk',
        html: `
          <div style="font-family: monospace; color: #111; max-width: 600px; margin: 0 auto;">
            <p>${name},</p>
            <p>Your operational diagnostic has been reviewed. You meet the criteria for the founding cohort.</p>
            <p><strong>Terminal access has been granted.</strong></p>
            <p>Your email address (${email}) has been whitelisted in our system. You may now initialize your profile and establish your operational protocol.</p>
            <br/>
            <a href="${signupUrl}" style="background-color: #111; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase;">Initialize Terminal Access</a>
            <br/><br/>
            <p>— Desk Operations</p>
          </div>
        `,
      });

      return NextResponse.json({ success: true, message: 'Applicant approved and email transmitted.' });
    }

  } catch (error) {
    console.error('Admin Action Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process application.' }, { status: 500 });
  }
}
