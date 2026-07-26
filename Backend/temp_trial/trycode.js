import bcrypt from "bcryptjs";

const hashed_password= await bcrypt.hash("1234",10);

// console.log("Hashed Password:", hashed_password);

const isMatch= await bcrypt.compare("1234", '$2b$10$BV36AjZg5L9x/Sh71iZqGuSS7kVmHPHNulut7VOIbDPT5QMzT7Ndm');

console.log("Password Match:", isMatch);


