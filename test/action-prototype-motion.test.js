import test from 'node:test';
import assert from 'node:assert/strict';
import { SpriteMotion } from '../src/game/prototypeMotion.js';

test('walking advances poses, stopping returns to rest and zero dt freezes animation',()=>{
 const motion=new SpriteMotion();
 const a=motion.update(.1,true,1); assert.equal(a.frame,1);
 assert.equal(motion.update(0,true,1).frame,a.frame);
 assert.equal(motion.update(.1,false,0).frame,0);
});
test('attack releases once at the strike pose, cannot restart mid-swing and recovers',()=>{
 const motion=new SpriteMotion(); assert.equal(motion.startAttack(1),true);
 assert.equal(motion.startAttack(-1),false);
 assert.equal(motion.update(.09,false,-1).released,false);
 const strike=motion.update(.1,false,-1); assert.equal(strike.released,true); assert.equal(strike.frame,18); assert.equal(strike.facing,1);
 assert.equal(motion.update(.08,false,0).released,false);
 assert.equal(motion.update(.2,false,0).attacking,false);
 assert.equal(motion.startAttack(-1),true);
});
test('running advances poses with offset 8',()=>{
 const motion=new SpriteMotion();
 const runPose=motion.update(.1,true,1,true);
 assert.equal(runPose.running,true);
 assert.equal(runPose.frame >= 8 && runPose.frame <= 15,true);
});
test('a long frame still releases exactly once and direction survives vertical movement',()=>{
 const motion=new SpriteMotion(); motion.update(.1,true,-1);
 assert.equal(motion.update(.1,true,0).facing,-1);
 motion.startAttack(-1); assert.equal(motion.update(1,false,0).released,true);
 assert.equal(motion.update(.1,false,0).released,false);
});
