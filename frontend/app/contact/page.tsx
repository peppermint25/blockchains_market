"use client";

import { colors } from "@/app/styles/colors";

export default function Contact() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.background.primary }}>
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
                <h1 className="text-3xl font-bold mb-8" style={{ color: colors.text.primary }}>
                    Contact Us
                </h1>
                <div className="space-y-6" style={{ color: colors.text.secondary }}>
                    <p>
                        Any information should be available on the platform, but in any case - for any inquiries, please reach out to us at:
                    </p>
                    <p className="text-lg">
                        Email: <a href="mailto:pleasedont@bcsm.com" style={{ color: colors.text.primary }}>pleasedont@bcsm.com</a>
                    </p>
                    <p className="text-lg">
                        Phone: <a href="tel:+37167123456" style={{ color: colors.text.primary }}>+371 2000100</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
