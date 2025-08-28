import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyBearerToken } from '../../../../lib/firebase-admin';

export const runtime = 'nodejs';

async function requireAdmin(req: NextRequest) {
  const decoded = await verifyBearerToken(req.headers.get('authorization') || undefined);
  const adminDoc = await adminDb.doc(`admins/${decoded.uid}`).get();
  if (!adminDoc.exists) {
    return { decoded, isAdmin: false } as const;
  }
  return { decoded, isAdmin: true } as const;
}

export async function DELETE(req: NextRequest, { params }: { params: { uid: string } }) {
  try {
    const { isAdmin } = await requireAdmin(req);
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const targetUid = params.uid;
    if (!targetUid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

    const snap = await adminDb.collection('admins').get();
    if (snap.size <= 1) {
      return NextResponse.json({ error: 'Cannot remove last admin' }, { status: 400 });
    }

    await adminDb.doc(`admins/${targetUid}`).delete();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
