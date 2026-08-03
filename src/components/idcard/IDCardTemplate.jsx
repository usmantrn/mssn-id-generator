import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

// Using standard 85.6mm x 54mm ID card aspect ratio (or portrait 54mm x 85.6mm)
// We will render it at 3x resolution (approx 1000px) for crisp PDF generation

export const PortraitCard = ({ member, assets, frontRef, backRef }) => {
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
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* ═══ FRONT ═══ */}
      <div ref={frontRef} style={{ width: '1011px', height: '1594px', background: '#fff', position: 'relative', overflow: 'hidden', fontFamily: 'Arial, Helvetica, sans-serif' }}>
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
          
          <div style={{ marginTop: '30px', width: '354px', height: '425px', border: '6px solid #165a32', borderRadius: '24px', overflow: 'hidden', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0px 4px 12px rgba(0,0,0,0.1)' }}>
          {photo ? <img src={photo} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.05) brightness(1.05) saturate(1.1)' }} /> : <div style={{ opacity: 0.4 }}>No Photo</div>}
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

      {/* ═══ BACK ═══ */}
      <div ref={backRef} style={{ width: '1011px', height: '1594px', background: '#fff', position: 'relative', overflow: 'hidden', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div style={{ position: 'absolute', top: '47px', left: '50%', transform: 'translateX(-50%)', width: '189px', height: '65px', background: '#e4e4e4', borderRadius: '32px', border: '6px solid #c8c8c8' }} />
        
        <div style={{ position: 'absolute', top: '142px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '47px', marginBottom: '30px' }}>
            {mssnLogo && <img src={mssnLogo} style={{ width: '189px', height: '189px', objectFit: 'contain' }} />}
            <div style={{ width: '6px', height: '213px', background: '#165a32' }} />
            {futbLogo && <img src={futbLogo} style={{ width: '189px', height: '189px', objectFit: 'contain' }} />}
          </div>
          <div style={{ fontSize: '53px', fontWeight: 900, color: '#165a32', letterSpacing: '2px', textAlign: 'center', lineHeight: 1 }}>MSSN SOCIETY</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#333', letterSpacing: '10px', textAlign: 'center', marginTop: '9px' }}>FUTB CHAPTER</div>
          <div style={{ width: '70%', height: '4px', background: '#ddd', margin: '47px auto' }} />
          
          <div style={{ fontSize: '30px', color: '#333', textAlign: 'center', lineHeight: 1.5, padding: '0 71px' }}>
            This ID card is the property of<br/>
            MSSN Society FUTB Chapter.<br/>
            If found, please return to the<br/>
            <strong style={{ color: '#165a32' }}>FUTB OFFICE.</strong>
          </div>
          
          <div style={{ margin: '71px auto 0', width: '650px', borderTop: '4px solid #333', textAlign: 'center', paddingTop: '18px', position: 'relative' }}>
            {amirSig && <img src={amirSig} style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', maxWidth: '472px', maxHeight: '177px', objectFit: 'contain' }} />}
            <div style={{ fontStyle: 'italic', fontSize: '26px', color: '#666', position: 'relative', zIndex: 10 }}>Amir's Signature</div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '130px', background: '#165a32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '12px', textTransform: 'uppercase' }}>UNITY • FAITH • KNOWLEDGE • SERVICE</div>
        </div>
      </div>
    </div>
  );
};

export const LandscapeCard = ({ member, assets, frontRef, backRef }) => {
  const { mssnLogo, futbLogo, amirSig } = assets;
  const photo = member.photoUrl || '';
  const qrUrl = `https://mssn-id-generator.vercel.app/verify/${member.memberId}`;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ═══ FRONT ═══ */}
      <div ref={frontRef} style={{ width: '1011px', height: '638px', background: '#fff', position: 'relative', overflow: 'hidden', fontFamily: '"Inter", system-ui, sans-serif', boxSizing: 'border-box', border: '1px solid #eaeaea' }}>
        {/* Subtle Watermark */}
        {mssnLogo && <img src={mssnLogo} alt="Background Watermark" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, width: '450px', height: '450px', zIndex: 0 }} />}
        
        {/* Header Area */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px 10px', borderBottom: '3px solid #165a32', position: 'relative', zIndex: 1 }}>
          {futbLogo ? <img src={futbLogo} style={{ width: '100px', height: '100px', objectFit: 'contain', flexShrink: 0 }} /> : <div style={{ width: '100px', height: '100px' }} />}
          <div style={{ flex: 1, textAlign: 'center', padding: '0 16px' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#165a32', lineHeight: 1.1, letterSpacing: '1px' }}>MUSLIM STUDENTS' SOCIETY OF NIGERIA</div>
            <div style={{ fontSize: '20px', color: '#1a3a7a', fontWeight: 800, lineHeight: 1.4, marginTop: '4px' }}>FEDERAL UNIVERSITY OF TECHNOLOGY BABURA CHAPTER</div>
            <div style={{ fontSize: '15px', color: '#555', fontWeight: 600, fontStyle: 'italic', marginTop: '4px' }}>P.M.B. 2022, Babura, Nigeria.</div>
          </div>
          {mssnLogo ? <img src={mssnLogo} style={{ width: '100px', height: '100px', objectFit: 'contain', flexShrink: 0 }} /> : <div style={{ width: '100px', height: '100px' }} />}
        </div>
        
        {/* Official Banner */}
        <div style={{ background: 'linear-gradient(90deg, #165a32 0%, #1a3a7a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 32px', position: 'relative', zIndex: 1, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#fff', fontSize: '22px', fontWeight: 900, letterSpacing: '4px' }}>
            OFFICIAL ID CARD
          </div>
          <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', fontWeight: 600, letterSpacing: '1px' }}>SESSION: {member.session || '2025/2026'}</div>
        </div>
        
        {/* Main Content Area */}
        <div style={{ display: 'flex', height: '390px', position: 'relative', zIndex: 1, padding: '20px 24px', boxSizing: 'border-box' }}>
          
          {/* Photo Section (Left) */}
          <div style={{ width: '240px', height: '300px', background: '#ffffff', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, border: '4px solid #165a32', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {photo ? <img src={photo} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.05) brightness(1.05) saturate(1.1)' }} /> : <div style={{ opacity: 0.4, fontWeight: 600 }}>No Photo</div>}
          </div>
          
          {/* Details Section (Center) */}
          <div style={{ flex: 1, padding: '10px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '16px', alignItems: 'center' }}>
              <div style={{ color: '#555', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>NAME:</div>
              <div style={{ color: '#111', fontSize: '26px', fontWeight: 900, textTransform: 'uppercase', borderBottom: '2px dashed #ccc', paddingBottom: '4px' }}>{name}</div>

              <div style={{ color: '#555', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '12px' }}>POST:</div>
              <div style={{ color: '#165a32', fontSize: '22px', fontWeight: 900, textTransform: 'uppercase', borderBottom: '2px dashed #ccc', paddingBottom: '4px', marginTop: '12px' }}>{post}</div>

              <div style={{ color: '#555', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '12px' }}>ID NO:</div>
              <div style={{ color: '#111', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', borderBottom: '2px dashed #ccc', paddingBottom: '4px', marginTop: '12px' }}>{member.memberId}</div>

              <div style={{ color: '#555', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '12px' }}>ISSUED:</div>
              <div style={{ color: '#111', fontSize: '19px', fontWeight: 700, textTransform: 'uppercase', marginTop: '12px' }}>{issueDate}</div>
            </div>
          </div>
          
          {/* QR Code Section (Right) */}
          <div style={{ width: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ padding: '10px', background: '#fff', borderRadius: '16px', border: '3px solid #1a3a7a', boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}>
              <QRCodeCanvas value={qrUrl} size={140} level="M" />
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', fontWeight: 700, color: '#1a3a7a', letterSpacing: '1px', textAlign: 'center' }}>SCAN TO VERIFY</div>
          </div>
        </div>
        
        {/* Footer Bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', display: 'flex', zIndex: 2 }}>
          <div style={{ flex: 1, background: '#165a32' }} />
          <div style={{ flex: 1, background: '#1a3a7a' }} />
          <div style={{ flex: 1, background: '#4a90c4' }} />
        </div>
      </div>

      {/* ═══ BACK ═══ */}
      <div ref={backRef} style={{ width: '1011px', height: '638px', background: '#fff', position: 'relative', overflow: 'hidden', fontFamily: '"Inter", system-ui, sans-serif', boxSizing: 'border-box', border: '1px solid #eaeaea' }}>
        
        {/* Background Pattern */}
        {mssnLogo && <img src={mssnLogo} style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', opacity: 0.05, transform: 'rotate(15deg)' }} />}

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', padding: '40px 24px 20px', position: 'relative', zIndex: 1 }}>
          {futbLogo && <img src={futbLogo} style={{ width: '120px', height: '120px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />}
          {mssnLogo && <img src={mssnLogo} style={{ width: '120px', height: '120px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />}
        </div>
        
        <div style={{ position: 'relative', zIndex: 1, padding: '0 60px' }}>
          <div style={{ background: '#f8fafc', border: '2px solid #eaeaea', borderRadius: '16px', padding: '24px', marginTop: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#111', textAlign: 'center', lineHeight: 1.6, letterSpacing: '1px' }}>
              THIS ID CARD IS THE PROPERTY OF<br/>
              <span style={{ color: '#165a32' }}>MSSN SOCIETY FUTB CHAPTER</span>.
            </div>
            <div style={{ width: '60px', height: '4px', background: '#1a3a7a', margin: '20px auto' }} />
            <div style={{ fontSize: '22px', fontWeight: 600, color: '#444', textAlign: 'center', lineHeight: 1.5 }}>
              IF FOUND PLEASE RETURN TO THE FUTB MSSN OFFICE<br/>
              OR NEAREST POLICE STATION.
            </div>
          </div>
        </div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 80px', marginTop: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#333' }}>EXPIRES</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#b22222', marginTop: '4px' }}>{expiryDate}</div>
          </div>

          <div style={{ textAlign: 'center', position: 'relative', height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
            {amirSig && <img src={amirSig} style={{ position: 'absolute', bottom: '30px', maxWidth: '300px', maxHeight: '100px', objectFit: 'contain' }} />}
            <div style={{ width: '250px', borderTop: '2px solid #333', paddingTop: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#333' }}>Amir's Signature / توقيع الأمير</div>
            </div>
          </div>
        </div>
        
        {/* Footer Bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', display: 'flex', zIndex: 2 }}>
          <div style={{ flex: 1, background: '#165a32' }} />
          <div style={{ flex: 1, background: '#1a3a7a' }} />
          <div style={{ flex: 1, background: '#4a90c4' }} />
        </div>
      </div>
    </div>
  );
};
