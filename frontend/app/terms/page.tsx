"use client";

import { colors } from "@/app/styles/colors";

export default function TermsOfService() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.background.primary }}>
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
                <h1 className="text-4xl font-bold mb-2" style={{ color: colors.text.primary }}>
                    Terms of Service
                </h1>
                <p className="mb-8" style={{ color: colors.text.secondary }}>
                    Last Updated: January 2025
                </p>

                <div className="space-y-6" style={{ color: colors.text.secondary }}>

                    <section>
                        <h2 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                            1. Platform & Agreement
                        </h2>
                        <p className="text-justify">
                            By using this blockchain-based secondhand marketplace, you agree to these Terms. We use Ethereum smart contracts to facilitate secure transactions. Sales proceeds are donated to verified charities you select.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                            2. Registration & Accounts
                        </h2>
                        <p className="text-justify">
                            You must provide accurate information and keep your MetaMask wallet credentials secure. You're responsible for all account activity. We're not liable for unauthorized access due to credential mismanagement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                            3. Blockchain & Cryptocurrency
                        </h2>
                        <p className="text-justify">
                            All transactions use MetaMask and are permanently recorded on Ethereum. Blockchain transactions are irreversible. You assume all risks including price volatility, network delays, and gas fees.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                            4. Buying
                        </h2>
                        <p className="text-justify">
                            Review listings carefully before purchase. Funds are held in a smart contract until you confirm delivery within 14 days. After confirmation, funds automatically release to your selected verified charity. You must choose a charity at purchase.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                            5. Selling
                        </h2>
                        <p className="text-justify">
                            Provide accurate descriptions and images. Ship promptly with tracking info. Funds go to the buyer's selected charity, not directly to you. You can optionally donate items directly to verified charities.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                            6. Prohibited Items & Activity
                        </h2>
                        <p className="text-justify">
                            No illegal items, counterfeits, stolen goods, weapons, or fraudulent listings. No harassment, spam, or platform manipulation. Violations result in account suspension or termination.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                            7. Disputes
                        </h2>
                        <p className="text-justify">
                            Buyers can open disputes within 14 days for missing or misrepresented items. Administrators investigate and decide on refunds or dismissal. Decisions are final and recorded on the blockchain.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                            8. Charity Donations
                        </h2>
                        <p className="text-justify">
                            All transaction proceeds go to verified organizations you select. Community goals and totals are publicly displayed. Only platform-verified organizations can receive donations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                            9. Transparency & Data
                        </h2>
                        <p className="text-justify">
                            All transactions are permanent on the blockchain (amounts, wallet addresses, confirmations). Personal data is encrypted off-chain. Blockchain records cannot be deleted.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                            10. Liability Limitations
                        </h2>
                        <p className="text-justify">
                            The Platform is provided &#34;as-is.&#34; We&#39;re not liable for cryptocurrency volatility, blockchain delays, network failures, delivery issues, or user error. Our liability is limited to the disputed transaction amount.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                            11. Changes & Modifications
                        </h2>
                        <p className="text-justify">
                            We may modify, suspend, or discontinue the Platform, add/remove features, change fees, or terminate accounts. Continued use means acceptance of changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                            12. Intellectual Property & Indemnification
                        </h2>
                        <p className="text-justify">
                            The Platform is our property. You indemnify us from claims arising from your use, violations of these Terms, or violation of laws, including legal fees.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                            13. Contact
                        </h2>
                        <p className="text-justify">
                            Questions? Email pleasedont@bcsm.lv
                        </p>
                    </section>

                    <section>
                        <div className="p-4 border-l-4 rounded" style={{ backgroundColor: colors.background.secondary, borderColor: colors.text.primary }}>
                            <p className="font-semibold" style={{ color: colors.text.primary }}>
                                By using this Platform, you agree to these Terms. Continued use means acceptance of updates.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}