'use client';

import { useState, useRef } from 'react';
import type { JSX } from 'react';
import Image from 'next/image';

interface Feature {
  title: string;
  description: string;
  type?: 'video' | 'image';
  path?: string;
  format?: string;
  alt?: string;
  svg?: JSX.Element;
}

// The features array is a list of features that will be displayed in the accordion.
// - title: The title of the feature
// - description: The description of the feature (when clicked)
// - type: The type of media (video or image)
// - path: The path to the media (for better SEO, try to use a local path)
// - format: The format of the media (if type is 'video')
// - alt: The alt text of the image (if type is 'image')
const features = [
	{
		title: 'Advanced Predictions',
		description:
        'Utilize cutting-edge statistical models and machine learning algorithms to predict race outcomes with high accuracy, considering factors like athlete performance, weather conditions, and course difficulty.',
		type: 'image',
		path: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
		alt: 'Data visualization on a computer screen',
		svg: (
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
				<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
			</svg>
		),
	},
	{
		title: 'Real-Time Updates',
		description:
        'Get live updates during races, including athlete positions, shooting accuracy, and time differentials. Our real-time data keeps you informed and enhances your viewing experience.',
		type: 'video',
		path: 'https://d3m8mk7e1mf7xn.cloudfront.net/app/newsletter.webm',
		format: 'video/webm',
		svg: (
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
				<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		),
	},
	{
		title: 'Community Competitions',
		description:
        'Compete with friends and other biathlon enthusiasts in prediction leagues. Climb the leaderboards, win prizes, and earn bragging rights as the top biathlon predictor.',
		svg: (
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
				<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
			</svg>
		),
	},
	{
		title: 'Expert Insights',
		description:
        'Gain access to exclusive analysis from biathlon experts, including former athletes and coaches. Learn about race strategies, equipment choices, and training techniques that influence outcomes.',
		svg: (
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
				<path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
			</svg>
		),
	},
] as Feature[];

// An SEO-friendly accordion component including the title and a description (when clicked.)
const Item = ({
	feature,
	isOpen,
	setFeatureSelected,
}: {
  index: number;
  feature: Feature;
  isOpen: boolean;
  setFeatureSelected: () => void;
}) => {
	const accordion = useRef(null);
	const { title, description, svg } = feature;

	return (
		<li>
			<button
				className="relative flex gap-2 items-center w-full py-5 text-base font-medium text-left md:text-lg"
				onClick={(e) => {
					e.preventDefault();
					setFeatureSelected();
				}}
				aria-expanded={isOpen}
			>
				<span className={`duration-100 ${isOpen ? 'text-primary' : ''}`}>
					{svg}
				</span>
				<span
					className={`flex-1 text-base-content ${
						isOpen ? 'text-primary font-semibold' : ''
					}`}
				>
					<h3 className="inline">{title}</h3>
				</span>
			</button>

			<div
				ref={accordion}
				className={'transition-all duration-300 ease-in-out text-base-content-secondary overflow-hidden'}
				style={
					isOpen
						? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
						: { maxHeight: 0, opacity: 0 }
				}
			>
				<div className="pb-5 leading-relaxed">{description}</div>
			</div>
		</li>
	);
};

// A component to display the media (video or image) of the feature. If the type is not specified, it will display an empty div.
// Video are set to autoplay for best UX.
const Media = ({ feature }: { feature: Feature }) => {
	const { type, path, format, alt } = feature;
	const style = 'rounded-2xl aspect-square w-full sm:w-[26rem]';
	const size = {
		width: 500,
		height: 500,
	};

	if (type === 'video') {
		return (
			<video
				className={style}
				autoPlay
				muted
				loop
				playsInline
				controls
				width={size.width}
				height={size.height}
			>
				<source src={path} type={format} />
			</video>
		);
	} else if (type === 'image') {
		return (
			<Image
				src={path}
				alt={alt}
				className={`${style} object-cover object-center`}
				width={size.width}
				height={size.height}
			/>
		);
	} else {
		return <div className={`${style} !border-none`}></div>;
	}
};

// A component to display 2 to 5 features in an accordion.
// By default, the first feature is selected. When a feature is clicked, the others are closed.
const FeaturesAccordion = () => {
	const [featureSelected, setFeatureSelected] = useState<number>(0);

	return (
		<section
			className="py-24 md:py-32 space-y-24 md:space-y-32 max-w-7xl mx-auto bg-base-100"
			id="features"
		>
			<div className="px-8">
				<h2 className="font-extrabold text-4xl lg:text-6xl tracking-tight mb-12 md:mb-24">
            Elevate your biathlon experience
					<span className="bg-neutral text-neutral-content px-2 md:px-4 ml-1 md:ml-1.5 leading-relaxed whitespace-nowrap">
            with precision predictions
					</span>
				</h2>
				<div className="flex flex-col md:flex-row gap-12 md:gap-24">
					<div className="grid grid-cols-1 items-stretch gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20">
						<ul className="w-full">
							{features.map((feature, i) => (
								<Item
									key={feature.title}
									index={i}
									feature={feature}
									isOpen={featureSelected === i}
									setFeatureSelected={() => setFeatureSelected(i)}
								/>
							))}
						</ul>

						<Media feature={features[featureSelected]} key={featureSelected} />
					</div>
				</div>
			</div>
		</section>
	);
};
export default FeaturesAccordion;
