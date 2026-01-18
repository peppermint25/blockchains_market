"use client";

import { colors } from "@/app/styles/colors";

export default function Footer() {
    return (
        <footer
            className="bottom-0 left-0 right-0 border-t bg-background"
            style={{
                backgroundColor: colors.background.primary,
                borderColor: colors.border.primary
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold mb-4" style={{ color: colors.text.primary }}>
                            About Us
                        </h3>
                        <p className="text-sm" style={{ color: colors.text.tertiary }}>
                            Your trusted online marketplace for quality products.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-4" style={{ color: colors.text.primary }}>
                            Quick Links
                        </h3>
                        <ul className="space-y-2 text-sm" style={{ color: colors.text.tertiary }}>
                            <li>
                                <a
                                    href="/contact"
                                    onMouseEnter={(e) => e.currentTarget.style.color = colors.text.primary}
                                    onMouseLeave={(e) => e.currentTarget.style.color = colors.text.tertiary}
                                >
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/privacy"
                                    onMouseEnter={(e) => e.currentTarget.style.color = colors.text.primary}
                                    onMouseLeave={(e) => e.currentTarget.style.color = colors.text.tertiary}
                                >
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/terms"
                                    onMouseEnter={(e) => e.currentTarget.style.color = colors.text.primary}
                                    onMouseLeave={(e) => e.currentTarget.style.color = colors.text.tertiary}
                                >
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-4" style={{ color: colors.text.primary }}>
                            Contact us
                        </h3>
                        <p className="text-sm" style={{ color: colors.text.tertiary }}>
                            pleasedont@bcsm.com
                        </p>
                        <p className="text-sm" style={{ color: colors.text.tertiary }}>
                            +371 2000100
                        </p>
                    </div>
                </div>
                <div
                    className="mt-8 pt-8 border-t text-center text-sm"
                    style={{
                        borderColor: colors.border.primary,
                        color: colors.text.tertiary
                    }}
                >
                    © 2025 BCSM. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
