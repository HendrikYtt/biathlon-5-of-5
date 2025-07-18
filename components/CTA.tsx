'use client';
import Image from 'next/image';
import config from '@/config';
import {useRouter} from 'next/navigation';

const CTA = () => {
	const router = useRouter();
	return (
		<section className="relative hero overflow-hidden min-h-screen">
			<Image
				src="https://media.gettyimages.com/id/887904086/photo/bmw-ibu-world-cup-biathlon-hochfilzen.jpg?b=1&s=594x594&w=0&k=20&c=3U2RfI7Ge9oOV0xt35EV8ZckAQM6oVzg_J7kVxDtgG8="
				alt="Background"
				className="object-cover w-full"
				fill
			/>
			<div className="relative hero-overlay bg-neutral bg-opacity-70"></div>
			<div className="relative hero-content text-center text-neutral-content p-8">
				<div className="flex flex-col items-center max-w-xl p-8 md:p-0">
					<h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-8 md:mb-12">
                        Predict, Compete, Experience Biathlon
					</h2>
					<p className="text-lg opacity-80 mb-12 md:mb-16">
                        Elevate your biathlon viewing with advanced predictions, compete with friends, and gain insider
                        insights into every race.
					</p>

					<button className="btn btn-wide" onClick={() => {router.push(config.auth.loginUrl);}}>
                        Join {config.appName}
					</button>
				</div>
			</div>
		</section>
	);
};

export default CTA;
