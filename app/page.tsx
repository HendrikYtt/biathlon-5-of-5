import Header from '@/components/Header';
import React, {Suspense} from 'react';
import Problem from '@/components/Problem';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import FeaturesAccordion from '@/components/FeaturesAccordion';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import {Hero} from '@/components/Hero';

export default function Page() {
	return (
		<>
			<Suspense>
				<Header />
			</Suspense>
			<main className="min-h-[90vh]">
				<Hero/>
				{/*<Problem />*/}
				{/*<FeaturesAccordion />*/}
				{/*<Pricing />*/}
				{/*<FAQ />*/}
				{/*<CTA />*/}
			</main>
			{/*<Footer/>*/}
		</>
	);
}
