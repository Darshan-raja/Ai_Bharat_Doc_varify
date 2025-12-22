Issues found (in order) and fixes
500 on POST /api/users/send-otp: Email transporter threw when EMAIL_USER/EMAIL_PASSWORD missing. Fixed by making transporter optional; still generate/store OTP and return debugOtp in dev.
 slove const isDev = process.env.NODE_ENV !== 'production';

const allowedOrigins = [
  "https://hack-odhisha-team-fb.vercel.app",
  "http://localhost:3000",
  "http://localhost:8081",
  "http://10.158.87.77:8081",
  "http://localhost:8080",
  // Vite dev server default
  "http://localhost:5173"
];

CORS preflight failed from 192.168.137.1:8080: Origin not allowed. Fixed by reflecting origin in dev and adding Vite origin.
No email received: Because no SMTP creds. In dev, we now log OTP and return debugOtp; for real emails, set Gmail app password.

// In development, reflect whatever origin made the request to simplify local testing across IPs/ports
const corsOptions = isDev
  ? {
      origin: true, // reflect request origin
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }
  : {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };

app.use(cors(corsOptions));

JWT error (jsonwebtoken sign): Missing JWT_SECRET. Fixed with dev-safe fallback and guard if unset in prod.
Clicking “Verify Document Now” redirected to main/login: Route was protected; removed auth guard to allow public access.

// Use explicit JWT secret with a safe dev fallback; require in production
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev_jwt_secret_change_me' : undefined);

// Create transporter only if credentials exist to avoid runtime 500s
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set. Configure it in the environment.');
  return res.status(500).json({ success: false, message: 'Server configuration error' });
}

const token = jwt.sign({ id: user._id }, JWT_SECRET);

// Send email OTP if transporter is configured; otherwise skip sending in dev
try {
  if (transporter) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your Login OTP',
      text: `Your OTP code is ${otpCode}`,
      html: `<p>Your OTP code is <strong>${otpCode}</strong></p>`,
    });
  }

  // Update user with OTP details
  user.otp = {
    code: otpCode,
    expiresAt,
    sentTo: transporter ? ['email'] : []
  };
  await user.save();

  const responsePayload = {
    success: true,
    message: transporter ? 'OTP sent successfully' : 'OTP generated (email not configured)',
    otpSentTo: transporter ? ['email'] : []
  };

    // Log OTP in development for quick testing
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] OTP for ${user.email}: ${otpCode}`);
  }

  // In non-production, return OTP for easier local testing
  if (process.env.NODE_ENV !== 'production') {
    responsePayload.debugOtp = otpCode;
  }

  if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set. Configure it in the environment.');
  return res.status(500).json({ success: false, message: 'Server configuration error' });
}

const token = jwt.sign({ id: user._id }, JWT_SECRET, {
  expiresIn: '28d'
});

500 on POST /api/users/send-otp
Cause: Email transporter failed when EMAIL_USER/EMAIL_PASSWORD missing.
Fix: Make transporter optional; still generate/store OTP and return debugOtp in dev.
CORS preflight failed for local IP/ports
Cause: Origin not on allowlist.
Fix: Reflect request origin in development + include Vite dev origin.
No OTP email received
Cause: No SMTP credentials configured.
Fix: In dev, log OTP and include debugOtp in response; document SMTP setup for prod.
JWT sign error
Cause: Missing JWT_SECRET.
Fix: Add dev-safe fallback; guard in prod.
Verify page redirecting away
Cause: /verify guarded by auth.
Fix: Make /verify public route.
Code changes (file and line ranges)
_main_AI_docum_verify_/backend/server.js
12 to 12: add isDev flag
16 to 24: update allowedOrigins (add http://localhost:5173)
26 to 41: add dev-friendly CORS options and app.use(cors(corsOptions))
_main_AI_docum_verify_/backend/controllers/userController.js
9 to 17: add JWT_SECRET constant with dev fallback
10 to 22: make nodemailer transporter optional (only when creds exist)
52 to 62: guard and use JWT_SECRET in registerUser token issue
85 to 112: wrap OTP email send; allow skipping send when no transporter
113 to 120: log OTP in dev and return debugOtp in response (dev only)
154 to 165: guard and use JWT_SECRET in verifyLoginOTP token issue
_main_AI_docum_verify_/frontend/src/App.tsx
25 to 31: make /verify route public: <Route path="/verify" element={`<Verify />`} />

problrm

* Problem statement: Server startup fails with ReferenceError: isDev is not defined when configuring CORS.
* Environment: Node.js v22.
* Problem statement: Server startup fails with ReferenceError: isDev is not defined when configuring CORS.
* Environment: Node.js v22.17.1, file _main_AI_docum_verify_/backend/server.js.
* Impact: Backend cannot start; CORS options reference an undefined variable.

Code context (where error manifested):

* Problem statement: Server startup fails with ReferenceError: isDev is not defined when configuring CORS.
* Environment: Node.js v22.17.1, file _main_AI_docum_verify_/backend/server.js.
* Impact: Backend cannot start; CORS options reference an undefined variable.

Code context (where error manifested):

* Problem statement: Server startup fails with ReferenceError: isDev is not defined when configuring CORS.
* Environment: Node.js v22.17.1, file _main_AI_docum_verify_/backend/server.js.
* Impact: Backend cannot start; CORS options reference an undefined variable.

Code context (where error manifested):

* Problem statement: Server startup fails with ReferenceError: isDev is not defined when configuring CORS.
* Environment: Node.js v22.17.1, file _main_AI_docum_verify_/backend/server.js.
* Impact: Backend cannot start; CORS options reference an undefined variable.

Code context (where error manifested):

* Problem statement: Server startup fails with ReferenceError: isDev is not defined when configuring CORS.
* Environment: Node.js v22.17.1, file _main_AI_docum_verify_/backend/server.js.
* Impact: Backend cannot start; CORS options reference an undefined variable.

Code context (where error manifested):

* Problem statement: Server startup fails with ReferenceError: isDev is not defined when configuring CORS.
* Environment: Node.js v22.17.1, file _main_AI_docum_verify_/backend/server.js.
* Impact: Backend cannot start; CORS options reference an undefined variable.

Code context (where error manifested):

* Problem statement: Server startup fails with ReferenceError: isDev is not defined when configuring CORS.
* Environment: Node.js v22.17.1, file _main_AI_docum_verify_/backend/server.js.
* Impact: Backend cannot start; CORS options reference an undefined variable.

Code context (where error manifested):

* Problem statement: Server startup fails with ReferenceError: isDev is not defined when configuring CORS.
* Environment: Node.js v22.17.1, file _main_AI_docum_verify_/backend/server.js.
* Impact: Backend cannot start; CORS options reference an undefined variable.

Code context (where error manifested):

* Problem statement: Server startup fails with ReferenceError: isDev is not defined when configuring CORS.
* Environment: Node.js v22.17.1, file _main_AI_docum_verify_/backend/server.js.
* Impact: Backend cannot start; CORS options reference an undefined variable.

Code context (where error manifested):

* Server startup fails with ReferenceError: isDev is not defined when configuring CORS.
* Environment: Node.js v22.17.1, file _main_AI_docum_verify_/backend/server.js.
* Impact: Backend cannot start; CORS options reference an undefined variable.

Code context (where error manifested):

* Server startup fails with ReferenceError: isDev is not defined when configuring CORS.
* Environment: Node.js v22.17.1, file _main_AI_docum_verify_/backend/server.js.
* Impact: Backend cannot start; CORS options reference an undefined variable.

Code context (where error manifested):
Problem statement: Server startup fails with ReferenceError: isDev is not defined when configuring CORS.
Environment: Node.js v22.
// In development, reflect whatever origin made the request to simplify local testing across IPs/ports
const corsOptions = isDev
  ? {
      origin: true, // reflect request origin
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }
  : {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };

    ### Add this “Problem Statement” section to your report

- **Problem statement**: Server startup fails with ReferenceError: `isDev` is not defined when configuring CORS.
- **Environment**: Node.js v22.17.1, file `_main_AI_docum_verify_/backend/server.js`.
- **Impact**: Backend cannot start; CORS options reference an undefined variable.

Code context (where error manifested):

```24:33:_main_AI_docum_verify_/backend/server.js
// In development, reflect whatever origin made the request to simplify local testing across IPs/ports
const corsOptions = isDev
  ? {
      origin: true, // reflect request origin
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }
  : {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };
```

### Root cause

- `isDev` was used before being defined anywhere in `server.js`.

### Resolution

- Defined `isDev` from `NODE_ENV`.

Changed lines (addition at line 12):

```10:14:_main_AI_docum_verify_/backend/server.js
const app = express(); 
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(cookieParser());
```

### Commit message suggestion

fix(backend): define isDev to prevent ReferenceError in CORS config

- Add `const isDev = process.env.NODE_ENV !== 'production';` at `server.js:12`
- Unblocks server startup; CORS config works in dev/prod

Authentication error: JsonWebTokenError: secret or public key must be provided

---

### Problem: JWT verification failed — secret not provided

- **Problem statement**: Requests to protected routes failed with: `JsonWebTokenError: secret or public key must be provided`.
- **Environment**: Node.js v22.x, file `backend/middlewares/Auth.js`.
- **Impact**: All protected endpoints returned 401 due to JWT verification failing.

### Root cause

- Tokens were signed using a dev fallback secret in `backend/controllers/userController.js`, but the middleware verified using `process.env.JWT_SECRET` directly. When `JWT_SECRET` was not set in dev, verification had no secret, causing the error.

### Resolution

- Align the middleware with the controller by introducing the same `JWT_SECRET` fallback and adding a guard that returns 500 if missing in production.

### Files and lines changed

- `backend/middlewares/Auth.js`: lines 3–16 updated to define `JWT_SECRET` fallback and guard; verification now uses this value.

Code reference (after change):

```3:16:backend/middlewares/Auth.js
// Align JWT secret handling with controllers to avoid dev crashes
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev_jwt_secret_change_me' : undefined);
export const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
      
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not set. Configure it in the environment.');
            return res.status(500).json({ success: false, message: 'Server configuration error' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
```

### Operational notes

- In dev, it works without setting `JWT_SECRET` because of the fallback. In production, set `JWT_SECRET` so both signing and verifying use the same secret.
- Cookies are set with `secure: true` and `sameSite: "None"`. For local HTTP testing, prefer sending `Authorization: Bearer <token>` or run HTTPS locally.
