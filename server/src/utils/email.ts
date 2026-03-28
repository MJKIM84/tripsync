import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'TripSync <noreply@tripsync.app>';

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[Email] Would send to ${to}: ${subject}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
  } catch (error) {
    console.error('[Email] Failed to send:', error);
  }
}

export function inviteEmailHtml(inviterName: string, tripTitle: string, appUrl: string) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #1E3A5F;">TripSync 여행 초대</h2>
      <p><strong>${inviterName}</strong>님이 <strong>"${tripTitle}"</strong> 여행에 초대했습니다.</p>
      <a href="${appUrl}" style="display: inline-block; background: #1E3A5F; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">여행 확인하기</a>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">TripSync - 함께 보는 여행</p>
    </div>
  `;
}

export function inviteLinkEmailHtml(inviterName: string, tripTitle: string, joinLink: string) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #1E3A5F;">TripSync 여행 초대</h2>
      <p><strong>${inviterName}</strong>님이 <strong>"${tripTitle}"</strong> 여행에 초대했습니다.</p>
      <p>아래 링크를 클릭하여 여행에 참여하세요:</p>
      <a href="${joinLink}" style="display: inline-block; background: #1E3A5F; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">여행 참여하기</a>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">이 링크는 48시간 후 만료됩니다.</p>
    </div>
  `;
}

export function passwordResetEmailHtml(resetLink: string) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #1E3A5F;">비밀번호 재설정</h2>
      <p>아래 링크를 클릭하여 비밀번호를 재설정하세요:</p>
      <a href="${resetLink}" style="display: inline-block; background: #1E3A5F; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">비밀번호 재설정</a>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">이 링크는 1시간 후 만료됩니다. 본인이 요청하지 않았다면 무시하세요.</p>
    </div>
  `;
}
