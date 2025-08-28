import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyBearerToken } from '../../../lib/firebase-admin';

export const runtime = 'nodejs';

async function requireAdmin(req: NextRequest) {
  const decoded = await verifyBearerToken(req.headers.get('authorization') || undefined);
  const adminDoc = await adminDb.doc(`admins/${decoded.uid}`).get();
  if (!adminDoc.exists) {
    return { decoded, isAdmin: false } as const;
  }
  return { decoded, isAdmin: true } as const;
}

export async function GET(req: NextRequest) {
  try {
    const { isAdmin } = await requireAdmin(req);
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const snap = await adminDb.collection('admins').get();
    const admins = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ admins });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { decoded, isAdmin } = await requireAdmin(req);
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { uid, email } = body || {};
    if (!uid && !email) return NextResponse.json({ error: 'Provide uid or email' }, { status: 400 });

    let targetUid = uid as string | undefined;
    let targetProfile: any = {};

    if (!targetUid && email) {
      // Resolve via Admin Auth
      const { adminAuth } = await import('../../../lib/firebase-admin');
      const userRecord = await adminAuth.getUserByEmail(email);
      targetUid = userRecord.uid;
      targetProfile = { email: userRecord.email, displayName: userRecord.displayName };
    }

    if (!targetUid) return NextResponse.json({ error: 'Unable to resolve uid' }, { status: 400 });

    const ref = adminDb.doc(`admins/${targetUid}`);
    await ref.set({
      createdAt: Date.now(),
      createdBy: decoded.uid,
      ...targetProfile,
    }, { merge: true });

    const doc = await ref.get();
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
