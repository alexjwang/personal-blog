---
layout: post
title: "startup logs 5"
date: 2022-11-07
categories:
---
## logs
We are working on building out and launching a beta for our AI writing project this week.

### Day 203: November 7, 2022
All four of us are focused on building out the product now. I'm still stuck on building out edit suggestions—working with the editor DOM has actually been super annoying to figure out from scratch (I keep running into a lot of bugs regarding our sync engine as well).

[Text-to-Figma](https://twitter.com/mathemagic1an/status/1589657222094934016?s=20&t=Jy1u3bfxLaPE35NxwHMgrA)

![11-7]({{"/assets/images/11-7-22.jpg" | prepend: site.baseurl }})
*Is it just me or is cutting scallions super satisfying*

### Day 204: November 8, 2022
We've built out essentially all the basic functionalities you'd want in a non-AI-powered text editor. There's only one AI feature that's really left (the edit suggestions that I'm working on). There's a lot of gnarly CRDT sync stuff with rich text that I'm still sorting through, but progress today along this front has been pretty good.

John has been building out prototypes on Figma, which are surprisingly good at replicating what the actual experience would be. It responds to clicks/keyboard commands similar to what the actual app would have, and it's been useful for translating what John is envisioning to what I need to build in code.

[Scale releases platform for LLM apps](https://twitter.com/alexandr_wang/status/1590081944603484160?s=20&t=q51RCgzOUYgSe-fMmEe2JA)

![11-8]({{"/assets/images/11-8-22.jpg" | prepend: site.baseurl }})
*I really like the color of this car (oak green I believe)*

### Day 205: November 9, 2022

First off, damn what a crazy 48 hours it's been in the land of crypto.

I have most of the core functionality working for edit suggestions, but there are still a lot of bugs when it comes to syncing complex suggestion operations. I'm starting to think that my code might be a little too naive, and getting a fully bug-free implementation of what I'm envisioning will take a lot longer than I initially expected. It's complicated enough that Kevin has also been working on this problem alongside me. John and Tae are still focused on product development/UIUX design.

We're slowly starting to talk to our friends about what we're currently building (AI text editor), and it's been really nice to see how excited everyone is getting. Hopefully, that excitement translates into something more tangible at scale when we actually launch, but it's always nice to see people you care about happy for you.

[Contrastive Search](https://twitter.com/joao_gante/status/1590293010385760256?s=20&t=LCiCvBZkPN2KqGdDvZJkMQ)

![11-9]({{"/assets/images/11-9-22.jpg" | prepend: site.baseurl }})
*Doing work in bed at night is kinda the move, especially for tasks that don't require a monitor.*

### Day 206: November 10, 2022
This week really flew by. We're meeting Ben, our primary mentor during the Neo accelerator, tomorrow, and our goal is to show him a working demo with all of our core functionality (AI content generation, commenting, AI edit suggestions, and basic collaborative text editor stuff). The only real hard thing left at the moment is wrapping up the edit suggestions, but we should be able to finish by EOD.

[Emergent abilities in larger models](https://ai.googleblog.com/2022/11/characterizing-emergent-phenomena-in.html)

![11-10]({{"/assets/images/11-10-22.JPG" | prepend: site.baseurl }})
*90% of my BeReals are just us working in this room.*

### Day 207: November 11, 2022
We pushed our meeting with our mentor to Monday since he was on a flight during the originally scheduled time (which somehow Calendly didn't automatically block off). This gives us a little more breathing room to flesh out any remaining features (edit suggestions are completely done) and iron out any loose bugs this weekend. It's kinda interesting how every time we finish one task, there seems to be a million more things that we should build.

[New LLM search engine](https://metaphor.systems/)

![11-11]({{"/assets/images/11-11-22.jpg" | prepend: site.baseurl }})
*I'm conducting interviews for Columbia Early Decision applicants this year.*
