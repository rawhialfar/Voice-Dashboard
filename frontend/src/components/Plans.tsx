import { ReactNode } from 'react';
import { FaCrown } from 'react-icons/fa';
import {
  MilitaryTech as KnightIcon,
  Diamond as QueenIcon,
  WorkspacePremium as EmperorIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export interface Plan {
    name: string;
    price: string;
    amount: double;
    minutes: string;
    overageRate: string;
    description: string;
    icon: ReactNode;
    popularColor: string;
    popular: boolean;
    features: string[];
    minLimit: int;
    buttonText: string;
    color: string;
    trial?: boolean;
    addons?: string[];
    premiumFeatures?: string[];
    enterprise?: boolean;
}

export const usePlans = (): Plan[] => {
    const theme = useTheme();

    return [
        {
            name: 'Knight Plan',
            price: '$50/month',
            amount: 50,
            minutes: '100 minutes included',
            overageRate: '$0.6/min above limit',
            description: 'Ideal for small businesses & pilot projects',
            icon: <KnightIcon sx={{ color: theme.palette.primary.main }} />,
            popularColor: theme.palette.primary.main,
            popular: false,
            features: [
                '1 Agent included',
                '1 Phone Number',
                '1 Dashboard User',
                'Limited Email Support',
                'Basic call functionality',
                'Standard voice quality',
                'Basic call analytics'
            ],
            minLimit: 100,
            buttonText: 'Start Trial',
            color: theme.palette.primary.main,
            trial: true
        },
        {
            name: 'Queen Plan',
            price: '$300/month',
            amount: 300,
            minutes: '2,000 minutes included',
            overageRate: '$0.3/min above limit',
            description: 'Perfect for scaling teams (sales & customer support)',
            icon: <QueenIcon sx={{ color: theme.palette.success.main }} />,
            popularColor: theme.palette.success.main,
            popular: true,
            features: [
                '1 Agent included',
                '1 Phone Number',
                '10 Dashboard Users',
                'Email Support',
                'Live Chat Support',
                'Spam Detection',
                'Basic analytics',
                'HD voice quality',
                'Custom voicemail',
                'Call recording'
            ],
            addons: [
                '$50 / Extra agent',
                '$50 / White-Label option',
                '$50 / Knowledge Base Integration'
            ],
            minLimit: 2000,
            buttonText: 'Choose Queen',
            color: theme.palette.success.main
        },
        {
            name: 'King Plan',
            price: '$600/month',
            amount: 600,
            minutes: '4,000 minutes included',
            overageRate: '$0.2/min above limit',
            description: 'Best for mid-sized companies with high call volumes',
            icon: <FaCrown size={25} color={theme.palette.warning.main} />,
            popularColor: theme.palette.warning.main,
            popular: false,
            features: [
                'Everything in Queen Plan',
                'Advanced Analytics',
                '100 Dashboard Users',
                'Dedicated Account Manager',
                'Priority Chat + Support',
                'Custom reporting',
                'API access',
                'Advanced IVR',
                'Multi-language support'
            ],
            addons: [
                '$30 / extra agent',
                '$30 / White-Label option',
                '$30 / additional location',
                '$150 / Premium Features'
            ],
            premiumFeatures: [
                'Voice Cloning',
                'Custom Integration',
                'Multi-Language Support'
            ],
            minLimit: 4000,
            buttonText: 'Choose King',
            color: theme.palette.warning.main
        },
        {
            name: 'Emperor Plan',
            price: '$2,000/month',
            amount: 2000,
            minutes: '10,000 minutes included',
            overageRate: '$0.12/min above limit',
            description: 'Built for enterprises requiring high reliability',
            icon: <EmperorIcon sx={{ color: theme.palette.error.main }} />,
            popularColor: theme.palette.error.main,
            popular: false,
            features: [
                'Everything in King Plan',
                'Up to 3 Agents included',
                '3 Free Locations',
                'Unlimited Dashboard Users',
                'SLA Guarantee',
                'Priority Chat & Email Support',
                'Dedicated 24/7 Support',
                'White Label Option included',
                'Custom onboarding',
                'Advanced security'
            ],
            addons: [
                '$20 / extra agent',
                '$20 / additional location',
                '$100 / Premium Features'
            ],
            premiumFeatures: [
                'Voice Cloning',
                'Custom Integration',
                'Multi-Language Support'
            ],
            minLimit: 10000,
            buttonText: 'Choose Emperor',
            color: theme.palette.error.main,
            enterprise: true
        }
    ];
};