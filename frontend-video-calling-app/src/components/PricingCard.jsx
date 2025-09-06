import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';


const tiers = [
    {
        name: 'Learner Starter',
        id: 'tier-learner-starter',
        href: '/make-payment',
        priceMonthly: '$19',
        description: 'Ideal for learners beginning their educational journey with personalized support.',
        features: [
            'Access to 10 courses',
            '5 live video sessions/month',
            'Community forums access',
            '24/7 email support',
        ],
        featured: false,
    },
    {
        name: 'Educator Pro',
        id: 'tier-educator-pro',
        href: '/make-payment',
        priceMonthly: '$49',
        description: 'Perfect for educators to create and deliver engaging content to students.',
        features: [
            'Unlimited course creation',
            'Up to 50 learners',
            'Advanced session analytics',
            'Priority email & chat support',
            'Custom profile branding',
        ],
        featured: true,
    },
    {
        name: 'Institution Elite',
        id: 'tier-institution-elite',
        href: '/make-payment',
        priceMonthly: '$99',
        description: 'Comprehensive solution for institutions with large-scale learning needs.',
        features: [
            'Unlimited courses & learners',
            'Full analytics dashboard',
            'Dedicated account manager',
            'API & custom integrations',
            'Priority support with SLA',
            'Branded learning portal',
        ],
        featured: false,
    },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function PricingCards() {
    const navigate = useNavigate();

    const handleSelectPlan = (tier) => {
        navigate('/make-payment', { state: { plan: tier.name, amount: parseInt(tier.priceMonthly.replace('$', '')) } });
    };


    return (
        <div className="relative py-24 px-6 sm:py-32 lg:px-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-200 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-200 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="mx-auto max-w-7xl text-center">
                <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Pricing</h2>
                <p className="mt-2 text-5xl font-extrabold tracking-tight text-indigo-900 sm:text-6xl animate-fade-in">
                    Choose Your Learning Plan
                </p>
                <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-gray-600 sm:text-xl animate-fade-in">
                    Select a plan tailored to your learning or teaching goals, packed with features to empower your journey.
                </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-y-6 sm:mt-20 sm:gap-y-0 lg:grid-cols-3 lg:gap-x-8">
                {tiers.map((tier, tierIdx) => (
                    <div
                        key={tier.id}
                        className={classNames(
                            tier.featured
                                ? 'relative bg-gradient-to-r from-indigo-600 to-purple-600 bg-opacity-95 backdrop-blur-xl'
                                : 'bg-white bg-opacity-95 backdrop-blur-xl',
                            tier.featured
                                ? 'shadow-2xl'
                                : tierIdx === 0
                                    ? 'rounded-t-3xl lg:rounded-tr-none lg:rounded-bl-3xl'
                                    : tierIdx === 1
                                        ? 'lg:rounded-none'
                                        : 'rounded-b-3xl lg:rounded-tr-3xl lg:rounded-bl-none',
                            'rounded-3xl p-8 sm:p-10 transform transition-all duration-500 animate-slide-up hover:shadow-2xl hover:scale-105 relative',
                        )}
                    >
                        {tier.featured && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-800 text-sm font-bold px-4 py-1 rounded-full shadow-md animate-pulse">
                                Most Popular
                            </div>
                        )}
                        <h3
                            id={tier.id}
                            className={classNames(
                                tier.featured ? 'text-white' : 'text-indigo-700',
                                'text-base font-semibold tracking-wide uppercase',
                            )}
                        >
                            {tier.name}
                        </h3>
                        <p className="mt-4 flex items-baseline gap-x-2">
                            <span
                                className={classNames(
                                    tier.featured ? 'text-white' : 'text-indigo-900',
                                    'text-5xl font-extrabold tracking-tight',
                                )}
                            >
                                {tier.priceMonthly}
                            </span>
                            <span
                                className={classNames(
                                    tier.featured ? 'text-indigo-200' : 'text-gray-500',
                                    'text-base font-medium',
                                )}
                            >
                                /month
                            </span>
                        </p>
                        <p
                            className={classNames(
                                tier.featured ? 'text-indigo-200' : 'text-gray-600',
                                'mt-6 text-base leading-relaxed',
                            )}
                        >
                            {tier.description}
                        </p>
                        <ul
                            role="list"
                            className={classNames(
                                tier.featured ? 'text-indigo-200' : 'text-gray-600',
                                'mt-8 space-y-3 text-sm leading-relaxed',
                            )}
                        >
                            {tier.features.map((feature) => (
                                <li key={feature} className="flex gap-x-3 group relative">
                                    <FaCheckCircle
                                        aria-hidden="true"
                                        className={classNames(
                                            tier.featured ? 'text-indigo-300' : 'text-indigo-600',
                                            'h-5 w-5 flex-none group-hover:scale-110 transition-transform duration-200',
                                        )}
                                    />
                                    <span>{feature}</span>
                                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 -top-8 left-0 transform -translate-y-2 z-10">
                                        {feature}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleSelectPlan(tier)}
                            // href={tier.href}
                            aria-describedby={tier.id}
                            className={classNames(
                                tier.featured
                                    ? 'bg-yellow-400 text-gray-800 hover:bg-yellow-500'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700',
                                'mt-8 block rounded-full px-6 py-3 text-center text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden',
                            )}
                        >
                            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
                            Get Started Today
                        </button>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.7s ease-out;
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-in-out;
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .animate-pulse {
                    animation: pulse 2s infinite;
                }
            `}</style>
        </div>
    );
}