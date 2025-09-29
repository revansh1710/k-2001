const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ApplicationError } = require("@strapi/utils").errors;
const { sendWelcomeMail } = require("../../../utils/mailService");
module.exports = {
  async register(ctx) {
    const { email, username, password, fullName, phone } = ctx.request.body;

    if (!email || !username || !password) {
      return ctx.badRequest("Email, username, and password are required.");
    }

    const userExists = await strapi.db.query('api::user.user')
      .findOne({ where: { email: email.toLowerCase() } });

    if (userExists) {
      return ctx.conflict("Email already in use.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await strapi.db.query('api::user.user').create({
      data: {
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        fullName,
        phone,
        confirmed: true,
      },
    });

    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const sanitizedUser = await strapi.contentAPI.sanitize.output(
      newUser,
      strapi.getModel('api::user.user')
    );

    ctx.send({
      jwt: token,
      user: sanitizedUser,
    });
    await sendWelcomeMail({ to: email, name: fullName })
    ctx.send({ 'message': "user registered successfully, welcome email sent!" }, 200);
  },

  async login(ctx) {
    const { identifier, password } = ctx.request.body;

    if (!identifier || !password) {
      return ctx.badRequest("Please provide both identifier and password.");
    }

    const user = await strapi.db.query("api::user.user").findOne({
      where: {
        $or: [
          { email: { $eq: identifier.toLowerCase() } },
          { username: { $eq: identifier } },
        ],
      },
    });

    if (!user) {
      return ctx.unauthorized("Invalid identifier or password.");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return ctx.unauthorized("Invalid identifier or password.");
    }

    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Sanitize user
    const sanitizedUser = await strapi.contentAPI.sanitize.output(
      user,
      strapi.getModel("api::user.user")
    );

    // Return token in response body instead of cookie
    ctx.send({
      user: sanitizedUser,
      token,                     // <—— FRONTEND WILL USE THIS
      message: "Login successful",
    });
  },


  async findAll(ctx) {
    try {
      const users = await strapi.db.query('api::user.user').findMany({
        select: ['username', 'email', 'fullName', 'phone'],
      });
      ctx.send(users);
    } catch (err) {
      ctx.throw(500, 'Failed to fetch users');
    }
  },

  async logout(ctx) {
    ctx.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      expires: new Date(0),
      path: '/',
    });
    ctx.send({ message: "Logged out successfully." });
  }

}
