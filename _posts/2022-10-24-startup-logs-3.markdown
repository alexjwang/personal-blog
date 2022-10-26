---
layout: post
title: "startup logs 3"
date: 2022-10-24
categories:
---
## logs
We are continuing to build out our AI design product. We want to have a demo by October 31st.

### Day 189: October 24, 2022
Kevin has finished creating an intermediate language for the Figma API that should theoretically play better with our LLMs (the generated code is 4x smaller and thus we waste less tokens). We are training the larger model (2B parameters) on this intermediate language, which should cost us around a hundred bucks.

I'm pausing work on asset generation (so stuff like artwork/icons) to focus on generating images for landing pages/app designs. The imagined workflow would be to type in some sort of prompt/description of what you want, it generates many variants for a landing page design, you pick the one you like and it automatically generates a Figma design for it. There's multiple steps to this, namely the initial image generation/diffusion model, and then converting the image to code/design components (open research problem for multiple years now). The nice thing is that acquiring data might be relatively easy thanks to the abundance of app screenshots on app stores/available datasets. There are multiple approaches to fine-tuning models for this, but the things we are looking at include the imagic paper as well as the open-source approaches to fine-tuning for Pokemon/waifu's (highkey why is waifu generation leading the world of generative AI). Where there's a burning need, there's motivation for a solution I guess.

[Fine-tuning stable diffusion for pokemon](https://lambdalabs.com/blog/how-to-fine-tune-stable-diffusion-how-we-made-the-text-to-pokemon-model-at-lambda/)

![10-24]({{"/assets/images/10-24-22.jpg" | prepend: site.baseurl }})

*stallions*

### Day 190: October 25, 2022
Kevin has been scraping the internet for screenshots of good design for us to fine-tune our model. I've been working through several notebooks to attempt to replicate the results of research papers on fine-tuning—one interesting thing here to note is that Lambda Cloud compute is actually quite easy to use relative to the major cloud providers. However, the main issue is that I can't seem to suspend the machine without turning it completely off.

[LLMs writing informal proofs for math competition problems](https://twitter.com/AlbertQJiang/status/1584877475502301184)

[Waifu generation notes](https://gist.github.com/harubaru/f727cedacae336d1f7877c4bbe2196e1)

![10-25]({{"/assets/images/10-25-22.1.jpg" | prepend: site.baseurl }})
![10-25]({{"/assets/images/10-25-22.2.jpg" | prepend: site.baseurl }})
![10-25]({{"/assets/images/10-25-22.3.jpg" | prepend: site.baseurl }})
![10-25]({{"/assets/images/10-25-22.4.jpg" | prepend: site.baseurl }})
![10-25]({{"/assets/images/10-25-22.5.jpg" | prepend: site.baseurl }})
*some AI generated pokemon images*

![10-25]({{"/assets/images/10-25-22.jpg" | prepend: site.baseurl }})