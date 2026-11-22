"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

export interface QuickCardItem {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    iconColor: string;
    allowedRoles: string[];
}

export interface QuickAccessCardsGridProps {
    cards: QuickCardItem[];
    userRole: string;
}

export function QuickAccessCardsGrid({ cards, userRole }: QuickAccessCardsGridProps) {
    const visibleCards = cards.filter(
        (card) => !userRole || card.allowedRoles.includes(userRole)
    );

    return (
        <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
                visibleCards.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
            } gap-5`}
        >
            {visibleCards.map((card) => {
                const Icon = card.icon;
                return (
                    <Link
                        key={card.href}
                        href={card.href}
                        className="bg-card p-5 rounded-2xl border border-border shadow-2xs flex flex-col justify-between group hover:border-border-strong hover:shadow-md transition-all text-left block hover:-translate-y-0.5"
                    >
                        <div className="flex items-center justify-between mb-4 w-full">
                            <div
                                className={`p-3 rounded-xl border ${card.iconColor} transition-transform group-hover:scale-105`}
                            >
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="w-7 h-7 rounded-full bg-surface-subtle flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-accent transition-colors">
                                <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-role-dev transition-colors">
                                {card.title}
                            </h3>
                            <p className="text-xs font-normal text-muted-foreground line-clamp-2">
                                {card.description}
                            </p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
