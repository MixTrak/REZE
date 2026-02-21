import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { User } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        const users = await getCollection('users');
        const existingUser = await users.findOne({ username });

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const newUser: Omit<User, '_id'> = {
            username,
            password, // Plain text as requested
            googleApiKey: '',
            cseId: '',
            openRouterApiKey: '',
            openRouterModel: 'stepfun/step-3.5-flash:free',
        };

        const result = await users.insertOne(newUser);

        return NextResponse.json({
            success: true,
            user: { ...newUser, _id: result.insertedId.toString() }
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
    }
}
