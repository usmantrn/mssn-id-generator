import React from 'react';
import QRCode from 'qrcode.react';

// Using standard 85.6mm x 54mm ID card aspect ratio (or portrait 54mm x 85.6mm)
// We will render it at 3x resolution (approx 1000px) for crisp PDF generation

export const PortraitCard = React.forwardRef(({ member, assets }, ref) => {
  const { mssnLogo, futbLogo, amirSig } = assets;
  const photo = member.photoUrl || '';
  const name = `${member.firstName} ${member.middleName || ''} ${member.lastName}`.replace(/\s+/g, ' ').toUpperCase();
  const position = member.role === 'official' ? (member.position || 'OFFICIAL').toUpperCase() : 'MEMBER';
  
  const formatDate = (d) => {
    if (!d) return 'N/A';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };
  const expiry = member.expiryDate ? formatDate(member.expiryDate) : '';

  return (
    <div ref={ref} style={{ width: '1011px', height: '1594px', background: '#fff', position: 'relative', overflow: 'hidden', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div style={{ position: 'absolute', top: '47px', left: '50%', transform: 'translateX(-50%)', width: '189px', height: '65px', background: '#e4e4e4', borderRadius: '32px', border: '6px solid #c8c8c8' }} />
      
      <div style={{ position: 'absolute', top: '130px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {mssnLogo && <img src={mssnLogo} alt="MSSN Logo" style={{ width: '224px', height: '224px', objectFit: 'contain', marginBottom: '18px' }} />}
        <div style={{ fontSize: '53px', fontWeight: 900, color: '#165a32', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1 }}>MSSN SOCIETY</div>
        <div style={{ fontSize: '26px', fontWeight: 700, color: '#222', letterSpacing: '10px', textTransform: 'uppercase', marginTop: '6px' }}>FUTB CHAPTER</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', margin: '30px 59px 0', width: 'calc(100% - 118px)' }}>
          <div style={{ flex: 1, height: '4px', background: '#165a32' }} />
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#165a32', letterSpacing: '8px', whiteSpace: 'nowrap' }}>{member.role === 'official' ? 'OFFICIAL' : 'MEMBER'}</div>
          <div style={{ flex: 1, height: '4px', background: '#165a32' }} />
        </div>
        
        <div style={{ marginTop: '30px', width: '354px', height: '425px', border: '6px solid #165a32', borderRadius: '24px', overflow: 'hidden', background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {photo ? <img src={photo} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ opacity: 0.4 }}>No Photo</div>}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '614px', background: '#165a32', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-142px', left: '-10%', width: '120%', height: '283px', background: '#fff', borderRadius: '50%' }} />
        
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: '142px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '83px' }}>
          <div style={{ fontSize: '35px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '1px', lineHeight: 1.2, padding: '0 35px' }}>{name}</div>
          <div style={{ fontSize: '23px', fontWeight: 400, color: 'rgba(255,255,255,0.88)', textTransform: 'uppercase', letterSpacing: '5px', marginTop: '12px', textAlign: 'center' }}>{position}</div>
        </div>
        <div style={{ position: 'absolute', bottom: '35px', left: '47px', fontSize: '21px', color: 'rgba(255,255,255,0.65)', fontFamily: '"Courier New", monospace' }}>ID: {member.memberId}</div>
        {expiry && <div style={{ position: 'absolute', bottom: '35px', right: '47px', fontSize: '19px', color: 'rgba(255,255,255,0.65)' }}>EXP: {expiry}</div>}
      </div>
    </div>
  );
});

export const LandscapeCard = React.forwardRef(({ member, assets }, ref) => {
  const { mssnLogo, futbLogo } = assets;
  const photo = member.photoUrl || '';
  const qrUrl = `https://mssn-futb.com/verify/${member.memberId}`;
  const name = `${member.firstName} ${member.middleName || ''} ${member.lastName}`.replace(/\s+/g, ' ').trim().toUpperCase();
  const post = (member.role === 'official' ? (member.position || 'Official') : 'Member').toUpperCase();
  
  const formatDate = (d) => {
    if (!d) return 'N/A';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };
  const issueDate = formatDate(member.issueDate || new Date()).toUpperCase();
  const expiryDate = (member.expiryDate ? formatDate(member.expiryDate) : 'N/A').toUpperCase();

  return (
    <div ref={ref} style={{ width: '1011px', height: '638px', background: '#fff', position: 'relative', overflow: 'hidden', fontFamily: '"Inter", system-ui, sans-serif' }}>
      {mssnLogo && <img src={mssnLogo} alt="Background Watermark" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.04, width: '413px', height: '413px', zIndex: 0 }} />}
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 12px', borderBottom: '2px solid #ccc', position: 'relative', zIndex: 1 }}>
        {futbLogo ? <img src={futbLogo} style={{ width: '118px', height: '118px', objectFit: 'contain', flexShrink: 0 }} /> : <div style={{ width: '118px', height: '118px' }} />}
        <div style={{ flex: 1, textAlign: 'center', padding: '0 12px' }}>
          <div style={{ fontSize: '27px', fontWeight: 900, color: '#165a32', lineHeight: 1.2, letterSpacing: '1px' }}>MUSLIM STUDENTS' SOCIETY OF NIGERIA</div>
          <div style={{ fontSize: '21px', color: '#1a3a7a', fontWeight: 700, lineHeight: 1.3 }}>FEDERAL UNIVERSITY OF TECHNOLOGY BABURA CHAPTER</div>
          <div style={{ fontSize: '17px', color: '#555', fontWeight: 600, fontStyle: 'italic', marginTop: '6px' }}>P.M.B. 2022, Babura, Nigeria.</div>
        </div>
        {mssnLogo ? <img src={mssnLogo} style={{ width: '118px', height: '118px', objectFit: 'contain', flexShrink: 0 }} /> : <div style={{ width: '118px', height: '118px' }} />}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '2px solid #eaeaea', background: '#fdfdfd', position: 'relative', zIndex: 1 }}>
        <div style={{ background: '#b22222', color: '#fff', fontSize: '20px', fontWeight: 800, padding: '12px 30px', letterSpacing: '2px', borderRadius: '12px' }}>
          {member.role === 'official' ? 'OFFICIAL ID CARD' : 'MEMBERSHIP ID CARD'}
        </div>
        <div style={{ fontSize: '20px', color: '#555', fontWeight: 600 }}>Academic Session: {member.session || '2025/2026'}</div>
      </div>
      
      <div style={{ display: 'flex', height: '378px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '283px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRight: '2px solid #eaeaea' }}>
          {photo ? <img src={photo} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ opacity: 0.6 }}>No Photo</div>}
        </div>
        
        <div style={{ flex: 1, padding: '18px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <table style={{ width: '100%', marginLeft: '24px', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                { label: 'NAME', value: name },
                { label: 'POST', value: post },
                { label: 'DATE ISSUE', value: issueDate },
                { label: 'DATE EXPIRY', value: expiryDate }
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ color: '#555', whiteSpace: 'nowrap', fontSize: '19px', fontWeight: 700, textTransform: 'uppercase', paddingRight: '24px', paddingBottom: '12px' }}>{row.label}:</td>
                  <td style={{ color: '#111', fontSize: '21px', fontWeight: 900, whiteSpace: 'nowrap', paddingLeft: '12px', paddingBottom: '12px' }}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ width: '295px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 118px 41px 0', flexShrink: 0 }}>
          <div style={{ padding: '8px', background: '#fff', borderRadius: '12px', border: '2px solid #eaeaea', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}>
            <QRCode value={qrUrl} size={150} level="M" />
          </div>
        </div>
      </div>
      
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '47px', display: 'flex', zIndex: 2 }}>
        <div style={{ flex: 1, background: '#165a32' }} />
        <div style={{ flex: 1, background: '#1a3a7a' }} />
        <div style={{ flex: 1, background: '#4a90c4' }} />
      </div>
    </div>
  );
});
