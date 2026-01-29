import jwt from "jsonwebtoken";
const createToken = async (data) => {
    const token = await jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: "120m",
    });

    return token;
};

export default createToken;
