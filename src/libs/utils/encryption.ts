import * as bcrypt from 'bcrypt';

export const createHashedPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);

    return await bcrypt.hash(password, salt);
}

export const validatePassword = async (password: string, storedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, storedPassword);
}