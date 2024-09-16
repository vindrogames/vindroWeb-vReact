import React from 'react';
import { useState, useEffect, useRef } from 'react';
import StoryHelmet from './page-helmets/StoryHelmet';
import TimelineCard from '../components/TimelineCard';

const Story = () => {

  const cards = document.querySelectorAll('li.card')

  console.log(cards);

  

  return (
    <>
      <StoryHelmet />

      <main>
        
        <section className="hero-half">
          <h1>our<span className="inline-bold inline-teal">Stories</span></h1>
          <h2>A timeline of our learnings and projects</h2>
        </section>

        <section id="stories-page-content">
          <div id="timeline">
            <ul>
              <li className='card show'>
                <TimelineCard 
                  cardNum='1'
                  title='2016: First Game Jam'
                  text='We had been playing around with a lot of of different ideas, but nothing ever came of them. Zeneke found out about a Game Jam and we went for it! And thus was born "A Greek Tale". Not much, but a mile-stone for us! We actually created our first game, from scrath.'
                />
              </li>
              <li className='card show'>
                <TimelineCard 
                  cardNum='2'
                  title='2018: RPG Maker'
                  text='Mikelele knows some fellow teachers around Spain that use this software to create RPG Zelda type games for computers. We had to try it out and created our game about the human brain. Still no good name for it! There will be more RPG games to come...'
                />
              </li>
              <li className='card show'>
                <TimelineCard 
                  cardNum='3'
                  title='2019: GoDot'
                  text='Zeneke started playing around with GoDot and we used the boardgame "SET" to use it for some good. We tried this game with other languages but finally got the job done with GoDot. This is probably our most complete accomplishment so far!'
                />
              </li>
              <li className='card show'>
                <TimelineCard 
                  cardNum='4'
                  title='2020: Google Apps Script'
                  text='Mikelele wanted to take his use of Google Workspace tools to the next level and so started playing around with Spredsheets and then Google Apps Script. More than just automating certain processes, we can actually make games, or game-like activities, to do with students!.'
                />
              </li>
              <li className='card show'>
                <TimelineCard 
                  cardNum='5'
                  title='2020: Cloud Security'
                  text='Zeneke dives into the world of Cloud, specializing in Cloud Security at Siemens, automating deployments with scripts and dev-ops providing a stage for growing as a developer with Python and Dot.Net.'
                />
              </li>
              <li className='card show'>
                <TimelineCard 
                  cardNum='6'
                  title='2021: 42 Madrid'
                  text='Mikelele participated in the 42 Madrid Programming school "piscine" and was accepted into the 42 school where he learned a lot about programming in general, working with C and unix. We have not done any projects per say with C but it has deeply strengthened our learnings.'
                />
              </li>
              <li className='card show'>
                <TimelineCard 
                  cardNum='7'
                  title='2022: Vindrogames 2.0'
                  text='Mikelele begins Full-Stack courses centered around HTML, raw CSS with SASS and Javascript to revamp this very website you are visiting. This website is built with SASS, JQUERY and deployed with Netlify from our Github, not knowing you have been Netlified!'
                />
              </li>
              <li className='card show'>
                <TimelineCard 
                  cardNum='8'
                  title='2023: Logic and Games'
                  text='Zeneke & Mikelele really start exploring different algorithms by "digitalizing" different boardgames, mainly different cards games to play in solitaire version. If you like board games you have to check out on "SET!" on our games page. And stay tuned, there are many more to come!'
                />
              </li>
              <li className='card show'>
                <TimelineCard 
                  cardNum='9'
                  title='2024: Backend'
                  text='Things are really coming along and as Mikelele is becoming more confident, Zeneke pushes Vindrogames to work with the backend. We started out with a fun Madrid Calculator with some simple endpoints and are slowly working towards player profiles for our games and Apps.'
                />
              </li>
              <li className='card show'>
                <TimelineCard 
                  cardNum='10'
                  title='2024: React'
                  text='Mikelele upgrades web with React using Vite and We now include highscores, a leaderboard and we are working on a bracket app for sporting tournaments!'
                />
              </li>
            </ul>
          </div>
        </section>
      </main>
    </>
  )
};

export default Story;