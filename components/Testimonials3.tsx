import Image from 'next/image';
import { StaticImageData } from 'next/image';
import config from '@/config';

// The list of your testimonials. It needs 3 items to fill the row.
const list: {
  username?: string;
  name: string;
  text: string;
  img?: string | StaticImageData;
}[] = [
	{
		// Optional, use for social media like Twitter. Does not link anywhere but cool to display
		username: 'biathlon_fan',
		// REQUIRED
		name: 'Sarah Johnson',
		// REQUIRED
		text: 'This platform has completely transformed how I watch biathlon. The predictions make every race so much more exciting!',
		// Optional, a statically imported image (usually from your public folder—recommended) or a link to the person's avatar. Shows a fallback letter if not provided
		img: '',
	},
	{
		username: 'nordic_expert',
		name: 'Erik Nilsen',
		text: 'Finally a platform that understands biathlon strategy. The analysis tools help me make better predictions.',
	},
	{
		username: 'winter_sports',
		name: 'Anna Schmidt',
		text: 'Love competing with friends in prediction leagues. It adds so much fun to watching the World Cup races!',
	},
];

// A single testimonial, to be rendered in  a list
const Testimonial = ({ i }: { i: number }) => {
	const testimonial = list[i];

	if (!testimonial) return null;

	return (
		<li key={i}>
			<figure className="relative max-w-lg h-full p-6 md:p-10 bg-base-200 rounded-2xl max-md:text-sm flex flex-col">
				<blockquote className="relative flex-1">
					<p className="text-base-content/80 leading-relaxed">
						{testimonial.text}
					</p>
				</blockquote>
				<figcaption className="relative flex items-center justify-start gap-4 pt-4 mt-4 md:gap-8 md:pt-8 md:mt-8 border-t border-base-content/5">
					<div className="w-full flex items-center justify-between gap-2">
						<div>
							<div className="font-medium text-base-content md:mb-0.5">
								{testimonial.name}
							</div>
							{testimonial.username && (
								<div className="mt-0.5 text-sm text-base-content/80">
                  @{testimonial.username}
								</div>
							)}
						</div>

						<div className="overflow-hidden rounded-full bg-base-300 shrink-0">
							{testimonial.img ? (
								<Image
									className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
									src={list[i].img}
									alt={`${list[i].name}'s testimonial for ${config.appName}`}
									width={48}
									height={48}
								/>
							) : (
								<span className="w-10 h-10 md:w-12 md:h-12 rounded-full flex justify-center items-center text-lg font-medium bg-base-300">
									{testimonial.name.charAt(0)}
								</span>
							)}
						</div>
					</div>
				</figcaption>
			</figure>
		</li>
	);
};

const Testimonials3 = () => {
	return (
		<section id="testimonials">
			<div className="py-24 px-8 max-w-7xl mx-auto">
				<div className="flex flex-col text-center w-full mb-20">
					<div className="mb-8">
						<h2 className="sm:text-5xl text-4xl font-extrabold text-base-content">
              Join 500+ biathlon fans making predictions!
						</h2>
					</div>
					<p className="lg:w-2/3 mx-auto leading-relaxed text-base text-base-content/80">
            Don&apos;t take our word for it. Here&apos;s what they have to say
            about {config.appName}.
					</p>
				</div>

				<ul
					role="list"
					className="flex flex-col items-center lg:flex-row lg:items-stretch gap-6 lg:gap-8"
				>
					{[...Array(3)].map((e, i) => (
						<Testimonial key={i} i={i} />
					))}
				</ul>
			</div>
		</section>
	);
};

export default Testimonials3;
