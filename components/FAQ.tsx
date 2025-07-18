'use client';

import { useRef, useState } from 'react';
import type { JSX } from 'react';

// <FAQ> component is a lsit of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList arrayy below.

interface FAQItemProps {
    question: string;
    answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
	{
		question: 'What does the biathlon prediction service include?',
		answer: (
			<div className="space-y-2 leading-relaxed">
				<p>Our biathlon prediction service includes:</p>
				<ul className="list-disc list-inside">
					<li>Access to our advanced prediction algorithms</li>
					<li>Real-time updates on athlete performance and weather conditions</li>
					<li>Historical data analysis for informed predictions</li>
					<li>Community forums to discuss strategies with other fans</li>
					<li>Regular tips and insights from biathlon experts</li>
				</ul>
			</div>
		),
	},
	{
		question: 'How accurate are the predictions?',
		answer: (
			<p>
                While we use advanced statistical models and real-time data, biathlon outcomes can be unpredictable. Our service aims to provide you with the best possible insights, but we can not guarantee specific results. The excitement of biathlon lies in its unpredictability!
			</p>
		),
	},
	{
		question: 'Can I get a refund if I\'m not satisfied?',
		answer: (
			<p>
                Yes! We offer a 14-day money-back guarantee. If you are not completely satisfied with our service, you can request a full refund within 14 days of your purchase. Simply reach out to our support team via email.
			</p>
		),
	},
	{
		question: 'How often is the prediction data updated?',
		answer: (
			<div className="space-y-2 leading-relaxed">
				<p>We update our prediction data in real-time during biathlon events. Outside of events, we refresh our data and analysis daily to incorporate the latest athlete performance metrics, weather forecasts, and other relevant factors.</p>
			</div>
		),
	},
	{
		question: 'I have another question about the service',
		answer: (
			<div className="space-y-2 leading-relaxed">
                We are here to help! Please contact our support team at support@biathlonpredictor.com. We aim to respond to all inquiries within 24 hours.
			</div>
		),
	},
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
	const accordion = useRef(null);
	const [isOpen, setIsOpen] = useState(false);

	return (
		<li>
			<button
				className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
				onClick={(e) => {
					e.preventDefault();
					setIsOpen(!isOpen);
				}}
				aria-expanded={isOpen}
			>
				<span
					className={`flex-1 text-base-content ${isOpen ? 'text-primary' : ''}`}
				>
					{item?.question}
				</span>
				<svg
					className={'flex-shrink-0 w-4 h-4 ml-auto fill-current'}
					viewBox="0 0 16 16"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect
						y="7"
						width="16"
						height="2"
						rx="1"
						className={`transform origin-center transition duration-200 ease-out ${
							isOpen && 'rotate-180'
						}`}
					/>
					<rect
						y="7"
						width="16"
						height="2"
						rx="1"
						className={`transform origin-center rotate-90 transition duration-200 ease-out ${
							isOpen && 'rotate-180 hidden'
						}`}
					/>
				</svg>
			</button>

			<div
				ref={accordion}
				className={'transition-all duration-300 ease-in-out opacity-80 overflow-hidden'}
				style={
					isOpen
						? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
						: { maxHeight: 0, opacity: 0 }
				}
			>
				<div className="pb-5 leading-relaxed">{item?.answer}</div>
			</div>
		</li>
	);
};

const FAQ = () => {
	return (
		<section className="bg-base-200" id="faq">
			<div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
				<div className="flex flex-col text-left basis-1/2">
					<p className="inline-block font-semibold text-primary mb-4">FAQ</p>
					<p className="sm:text-4xl text-3xl font-extrabold text-base-content">
                        Frequently Asked Questions
					</p>
				</div>

				<ul className="basis-1/2">
					{faqList.map((item, i) => (
						<FaqItem key={i} item={item} />
					))}
				</ul>
			</div>
		</section>
	);
};

export default FAQ;
