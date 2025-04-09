import 'phaser';
import { StudyWelcomeScene } from './study/StudyWelcomeScene';
import { StudyScene } from './study/StudyScene';
import { MessageScene } from './controls/overlays/MessageScene';
import { AboutScene } from './AboutScene';

// 检测是否为移动设备
const isMobile = () => {
  return window.innerWidth < 800;
};


const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game',
  backgroundColor: '#ffffff',
  scene: [
    StudyWelcomeScene, 
    StudyScene,
    MessageScene,
    AboutScene
  ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x:0 },
      debug: false
    }
  }
};

new Phaser.Game(config);