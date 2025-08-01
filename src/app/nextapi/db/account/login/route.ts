import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbPromise from "@/sqlite/userdb";

export async function POST(req: NextRequest) {
    try {
        let { username, password } = await req.json();
        username = username.trim().toLowerCase();
        password = password.trim();
        if (typeof username !== 'string' || typeof password !== 'string' || !username.match(/^[a-zA-Z0-9]+$/))
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

        const db = await dbPromise;
        const user = await db.get(`SELECT * FROM users WHERE username = ?`, username);

        if (!user)
            return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match)
            return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });

        const sessionToken = crypto.randomUUID();
        await db.run(`INSERT INTO sessions (token, user_id) VALUES (?, ?)`, sessionToken, user.id);

        const res = NextResponse.json({ success: true });
        res.cookies.set('session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 365
        });
        return res;
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}