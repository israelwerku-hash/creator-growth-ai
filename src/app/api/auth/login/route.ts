import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { redis } from '@/lib/redis';
import crypto from 'crypto';
import { z } from 'zod';

// Strict validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
}).strict();

// Dummy hashing function to normalize response times and prevent timing enumeration
function executeDummyHash(password: string) {
  // Simulates a heavy bcrypt/argon2 hashing delay (~100-200ms depending on CPU)
  crypto.pbkdf2Sync(password || "dummy", 'static_salt_for_timing', 100000, 64, 'sha512');
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = loginSchema.safeParse(rawBody);

    if (!parsed.success) {
      executeDummyHash("dummy");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const { email, password } = parsed.data;

    const failureKey = `auth:attempts:${email}`;
    const storedAttempts = await redis.get(failureKey);
    const attempts = storedAttempts ? Number(storedAttempts) : 0;

    // 1. Capped Exponential Backoff
    if (attempts >= 5) {
      // Delay formula: 2 ^ (attempts - 4)
      // If 5 failures exist (this is attempt 6) -> 2^(5-4) = 2^1 = 2s
      // If 6 failures exist (this is attempt 7) -> 2^(6-4) = 2^2 = 4s
      // Capped at 900 seconds (15 minutes)
      const delaySeconds = Math.min(Math.pow(2, attempts - 4), 900);
      await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      // 2. Increment Failure Counter in Upstash
      await redis.incr(failureKey);
      
      // 3. Timing Attack Prevention (Zero State Leakage)
      // Supabase responds fast if the account doesn't exist.
      // We burn CPU cycles to normalize the time.
      executeDummyHash(password);
      
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 4. Success -> Reset Backoff Counter
    await redis.del(failureKey);
    
    return NextResponse.json({ success: true, user: data.user }, { status: 200 });

  } catch (err) {
    executeDummyHash("dummy");
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
