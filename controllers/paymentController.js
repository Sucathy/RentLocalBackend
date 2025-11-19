// // controllers/paymentController.js
// import fs from "fs";
// import nodemailer from "nodemailer";
// import path from "path";
// import PDFDocument from "pdfkit";

// export const sendBookingInvoice = async (userEmail, bookingData) => {
//     try {
//         // ensure invoices folder exists
//         const invoicesDir = path.join(process.cwd(), "invoices");
//         if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

//         // 1️⃣ Create invoice PDF
//         const doc = new PDFDocument();
//         const invoicePath = path.join(invoicesDir, `invoice_${bookingData.orderId}.pdf`);
//         doc.pipe(fs.createWriteStream(invoicePath));

//         doc.fontSize(18).text("PG Local - Booking Invoice", { align: "center" });
//         doc.moveDown();
//         doc.fontSize(12).text(`Booking ID: ${bookingData.orderId}`);
//         doc.text(`Payment ID: ${bookingData.paymentId}`);
//         doc.text(`Property: ${bookingData.title}`);
//         doc.text(`Location: ${bookingData.location}`);
//         doc.text(`Check-in: ${bookingData.checkIn}`);
//         doc.text(`Check-out: ${bookingData.checkOut}`);
//         doc.text(`Total Paid: ₹${bookingData.price}`);
//         doc.moveDown();
//         doc.text("Thank you for booking with PG Local!");
//         doc.end();

//         // 2️⃣ Setup Nodemailer
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.SMTP_USER,
//                 pass: process.env.SMTP_PASS,
//             },
//         });

//         // 3️⃣ Send Email
//         await transporter.sendMail({
//             from: `"PG Local" <${process.env.SMTP_USER}>`,
//             to: userEmail,
//             subject: "Your PG Booking Invoice",
//             text: `Dear Customer,\n\nThank you for booking ${bookingData.pgName}.\nAttached is your booking invoice.\n\nRegards,\nPG Local Team`,
//             attachments: [
//                 {
//                     filename: `invoice_${bookingData.orderId}.pdf`,
//                     path: invoicePath,
//                 },
//             ],
//         });

//         console.log("✅ Invoice email sent successfully");
//     } catch (error) {
//         console.error("❌ Error sending invoice email:", error);
//     }
// };



import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";
import PDFDocument from "pdfkit";

export const sendBookingInvoice = async (userEmail, bookingData) => {
    try {
        const invoicesDir = path.join(process.cwd(), "invoices");
        if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

        const doc = new PDFDocument();
        const invoicePath = path.join(invoicesDir, `invoice_${bookingData.orderId}.pdf`);
        doc.pipe(fs.createWriteStream(invoicePath));

        doc.fontSize(18).text("PG Local - Booking Invoice", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Booking ID: ${bookingData.orderId}`);
        doc.text(`Payment ID: ${bookingData.paymentId}`);
        doc.text(`Property: ${bookingData.title}`);
        doc.text(`Location: ${bookingData.location}`);
        doc.text(`Check-in: ${bookingData.checkIn}`);
        doc.text(`Check-out: ${bookingData.checkOut}`);
        doc.text(`Total Paid: ₹${bookingData.price}`);
        doc.moveDown();
        doc.text("Thank you for booking with PG Local!");
        doc.end();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        await transporter.sendMail({
            from: `"PG Local" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: "Your PG Booking Invoice",
            text: `Dear Customer,\n\nThank you for booking ${bookingData.pgName}.\nAttached is your booking invoice.\n\nRegards,\nPG Local Team`,
            attachments: [{ filename: `invoice_${bookingData.orderId}.pdf`, path: invoicePath }],
        });

        console.log("✅ Invoice email sent successfully");
    } catch (error) {
        console.error("❌ Error sending invoice email:", error);
    }
};
