"use client";

import { colors } from "@/app/styles/colors";

export default function Privacy() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.background.primary }}>
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
                <h1 className="text-3xl font-bold mb-8" style={{ color: colors.text.primary }}>
                    Privacy Policy
                </h1>
                <div className="space-y-4" style={{ color: colors.text.secondary }}>
                    <p>
                        We collect and process personal information necessary to provide our marketplace services.
                    </p>
                    <p>
                        Your data is stored securely and used only for order processing and service improvement.
                    </p>
                    <p>
                        We do not share your information with third parties without consent.
                    </p>
                </div>
            </div>
        </div>
    );
}
