"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const jobs_1 = __importDefault(require("./jobs"));
const app = (0, express_1.default)();
app.use((0, body_parser_1.json)());
app.use('/jobs', jobs_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
});
