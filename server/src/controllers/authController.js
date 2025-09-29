const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configure Passport Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0].value,
          role: 'user',
          isVerified: true // Google accounts are pre-verified
        }
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

const authController = {
  // Initiate Google OAuth
  googleAuth: passport.authenticate('google', {
    scope: ['profile', 'email']
  }),

  // Handle Google OAuth callback
  googleAuthCallback: [
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
      try {
        // Generate JWT token
        const token = jwt.sign(
          {
            userId: req.user.id,
            email: req.user.email
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&success=true`);
      } catch (error) {
        console.error('Auth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }
    }
  ],

  // Verify JWT token
  verifyToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isVerified: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  },

  // Logout
  logout: (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isVerified: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { name, email } = req.body;

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          name: name || undefined,
          email: email || undefined
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isVerified: true,
          createdAt: true
        }
      });

      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'Email already in use' });
      } else {
        res.status(500).json({ error: 'Failed to update profile' });
      }
    }
  },

  // Email/Password Registration
  register: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'user',
          isVerified: false // Email verification could be added later
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          isVerified: true,
          createdAt: true
        }
      });

      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  },

  // Email/Password Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user data and token
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      };

      res.json({ token, user: userData });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }
};

module.exports = authController;