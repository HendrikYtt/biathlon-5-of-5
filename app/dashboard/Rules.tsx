import React from 'react';

export const Rules = () => {
	return (
		<div className="p-4 mx-auto">
			<div className="mx-auto max-w-4xl">
				<div className="">
					<h1 className="text-3xl font-bold mb-4">Reeglid</h1>

					<div className="prose">
						<p className="text-lg mb-4">
							Ennusta poodium õigesti ning teeni lisaküsimustega punkte juurde!
						</p>

						<div className="collapse collapse-arrow mb-4 border border-base-content/20 shadow-md rounded-lg">
							<input type="checkbox"/>
							<div className="collapse-title text-xl font-medium">
								Põhireeglid
							</div>
							<div className="collapse-content">
								<ul className="list-disc pl-8 space-y-2">
									<li>Osaleda saad igal ajal. Igal osalejal on alguses 0 punkti, isegi siis, kui alustad ennustamisega pärast mõne võistluse toimumist.</li>
									<li>Oma vastava võistluse ennustusi saad lisada/muuta kuni vastava võistluse stardini. Siis lähevad vastava distantsi ennustused &quot;lukku&quot; ja neid rohkem muuta ei saa.</li>
									<li>Stardiajad võetakse <a href="https://www.biathlonresults.com/#/start" className="link link-primary">IBU ametlikult lehelt</a></li>
									<li>Kuni stardipaugu kõlamiseni näed ainult oma pakkumisi, pärast starti näed ka ülejäänud mängijate pakkumisi.</li>
									<li>Iga distantsi kohta tuleb 3-6 küsimust, millest esimesed 3 on poodium. Lisaküsimusi tuleb maksimaalselt 3.</li>
								</ul>
							</div>
						</div>

						<div className="collapse collapse-arrow mb-4 border border-base-content/20 shadow-md rounded-lg">
							<input type="checkbox"/>
							<div className="collapse-title text-xl font-medium">
								Punktiarvestus
							</div>
							<div className="collapse-content">
								<div className="space-y-4">
									<div>
										<h3 className="font-bold">1. Poodium</h3>
										<ul className="list-disc pl-8">
											<li>õige nimi esikolmikus - 1 punkt</li>
											<li>õige nimi + õige koht esikolmikus - 3 punkti</li>
										</ul>
									</div>

									<div>
										<h3 className="font-bold">2. Lisaküsimus</h3>
										<ul className="list-disc pl-8">
											<li>tavaküsimused - 1 punkt</li>
											<li>täpse koha küsimused teatevõistlustel ja mass stardil (+-1 koht ehk
												kolmene vahemik) ja ind võistlusdistantsidel va mass (+-3 kohta ehk
												seitsmene vahemik) - 3 punkti
											</li>
										</ul>
									</div>
								</div>
								<p className="mt-4">Punktid arvutatakse pärast vastava võistluse lõppu.</p>
							</div>
						</div>

						<div className="collapse collapse-arrow mb-4 border border-base-content/20 shadow-md rounded-lg">
							<input type="checkbox"/>
							<div className="collapse-title text-xl font-medium">
								Liiga
							</div>
							<div className="collapse-content">
								<p>
									Iga ennustaja saab moodustada &quot;oma&quot; ennustusliiga, kuhu saad
									sõpru/tuttavaid
									kutsuda.
									Liigaga saab liituda, kui tead liiga parooli.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};