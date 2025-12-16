"use client";

import Navigation from "@/app/components/Navigation";
import { colors } from "@/app/styles/colors";
import { colorCodes } from "@/app/styles/color-codes";
// import { colors } from "./styles/colors";
// import { colorCodes } from "./styles/color-codes";
import Footer from "@/app/components/Footer";
// import Footer from "./components/Footer";
import Image from "next/image";

// Hard coded charities in Latvia -> later change to a better implementation
const charities = [
    {
        id: 1,
        name: "'Latvijas Dabas fonds'",
        description: "Preserving and restoring natural diversity in Latvia through practical conservation work, protecting species and habitats.",
        category: "Environment",
        categoryClass: colorCodes.environment.background,
        image: "/next.svg"
    },
    {
        id: 2,
        name: "'Latvijas Bērnu Fonds'",
        description: "Latvia's Children's Fund provides support to children and families in need, including summer camps and rehabilitation services.",
        category: "Families in Need",
        categoryClass: colorCodes.familiesInNeed.background,
        image: "/next.svg"
    },
    {
        id: 3,
        name: "'Labās Mājas' Animal Shelter",
        description: "An animal shelter in Latvia, providing care and new homes for abandoned dogs and cats in Riga.",
        category: "Animal Welfare",
        categoryClass: colorCodes.animalWelfare.background,
        image: "/next.svg"
    },
    {
        id: 4,
        name: "'Ziedot.lv'",
        description: "Latvia's leading charity platform connecting donors with verified charity projects since 2003, ensuring safe and transparent giving.",
        category: "Community Support",
        categoryClass: colorCodes.communitySupport.background,
        image: "/next.svg"
    },
    {
        id: 5,
        name: "'Latvia Charity Bank'",
        description: "Supporting low-income families with children through food, clothing, and essential services across Latvia and the Baltic States.",
        category: "Families in Need",
        categoryClass: colorCodes.familiesInNeed.background,
        image: "/next.svg"
    },
    {
        id: 6,
        name: "'Giving for Latvia'",
        description: "UK-based charity helping Latvian children in crisis centres and supporting vulnerable families through fundraising and donations.",
        category: "Families in Need",
        categoryClass: colorCodes.familiesInNeed.background,
        image: "/next.svg"
    },
    {
        id: 7,
        name: "'Ulubele' Animal Shelter",
        description: "A chain of animal shelters, operating in Latvia.",
        category: "Animal Welfare",
        categoryClass: colorCodes.animalWelfare.background,
        image: "/next.svg"
    },
    {
        id: 8,
        name: "Fonds 'Viegli'",
        description: "The fund provides support to community projects in Latvia.",
        category: "Community Support",
        categoryClass: colorCodes.communitySupport.background,
        image: "/next.svg"
    },
];

export default function Home() {
    const handleSupport = (charityName: string) => {
        console.log(`Supporting: ${charityName}`);
        alert(`Thank you for choosing to support ${charityName}!`);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.background.secondary }}>
            <Navigation />

            <section className="py-20" style={{ backgroundColor: colors.background.primary }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: colors.text.primary }}>
                        Support Causes That Matter
                    </h1>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.text.tertiary }}>
                        Make a difference by supporting verified charities making real impact around you.
                    </p>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {charities.map((charity) => (
                        <div
                            key={charity.id}
                            className="rounded-lg shadow-md transition-transform hover:scale-105"
                            style={{ backgroundColor: colors.background.primary }}
                        >
                            <div className="relative h-48" style={{ backgroundColor: colors.background.tertiary }}>
                                <Image
                                    src={charity.image}
                                    alt={charity.name}
                                    className="w-full h-full object-cover"
                                    width={300}
                                    height={200}
                                />
                                <span
                                    className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium"
                                    style={{
                                        backgroundColor: charity.categoryClass,
                                    }}
                                >
                                    {charity.category}
                                </span>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2" style={{ color: colors.text.primary }}>
                                    {charity.name}
                                </h3>

                                <p className="mb-4 text-sm" style={{ color: colors.text.secondary }}>
                                    {charity.description}
                                </p>

                                <button
                                    onClick={() => handleSupport(charity.name)}
                                    className="w-full py-2 px-4 rounded-lg font-medium transition-opacity hover:opacity-80 uppercase"
                                    style={{
                                        backgroundColor: colors.button.primary,
                                        color: colors.text.dark,
                                    }}
                                >
                                    Support
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}