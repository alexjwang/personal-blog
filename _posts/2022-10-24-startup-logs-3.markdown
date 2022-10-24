---
layout: post
title: "startup logs 3"
date: 2022-10-17
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