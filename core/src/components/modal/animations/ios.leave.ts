import { createAnimation } from '@utils/animation/animation';
import { getElementRoot } from '@utils/helpers';

import type { Animation } from '../../../interface';
import { SwipeToCloseDefaults } from '../gestures/swipe-to-close';
import type { ModalAnimationOptions } from '../modal-interface';

import { createSheetLeaveAnimation } from './sheet';

const createLeaveAnimation = () => {
  const backdropAnimation = createAnimation().fromTo('opacity', 'var(--backdrop-opacity)', 0);

  const wrapperAnimation = createAnimation().fromTo('transform', 'translateY(0vh)', 'translateY(100vh)');

  return { backdropAnimation, wrapperAnimation };
};

/**
 * iOS Modal Leave Animation
 */
export const iosLeaveAnimation = (baseEl: HTMLElement, opts: ModalAnimationOptions, duration = 500): Animation => {
  const { presentingEl, currentBreakpoint } = opts;
  const root = getElementRoot(baseEl);
  const { wrapperAnimation, backdropAnimation } =
    currentBreakpoint !== undefined ? createSheetLeaveAnimation(opts) : createLeaveAnimation();

  backdropAnimation.addElement(root.querySelector('ion-backdrop')!);

  wrapperAnimation.addElement(root.querySelectorAll('.modal-wrapper, .modal-shadow')!).beforeStyles({ opacity: 1 });

  const baseAnimation = createAnimation('leaving-base')
    .addElement(baseEl)
    .easing('cubic-bezier(0.32,0.72,0,1)')
    .duration(duration)
    .addAnimation(wrapperAnimation);

  if (presentingEl) {
    const isPortrait = window.innerWidth < 768;
    const hasCardModal =
      presentingEl.tagName === 'ION-MODAL' && (presentingEl as HTMLIonModalElement).presentingElement !== undefined;
    const presentingElRoot = getElementRoot(presentingEl);

    const presentingAnimation = createAnimation()
      .beforeClearStyles(['transform'])
      .afterClearStyles(['transform'])
      .onFinish((currentStep) => {
        // only reset background color if this is the last card-style modal
        if (currentStep !== 1) {
          return;
        }

        presentingEl.style.setProperty('overflow', '');

        const numModals = (
          Array.from(bodyEl.querySelectorAll('ion-modal:not(.overlay-hidden)')) as HTMLIonModalElement[]
        ).filter((m) => m.presentingElement !== undefined).length;
        if (numModals <= 1) {
          bodyEl.style.setProperty('background-color', '');
        }
      });

    const bodyEl = document.body;

    if (isPortrait) {
      const transformOffset = !CSS.supports('width', 'max(0px, 1px)') ? '30px' : 'max(30px, var(--ion-safe-area-top))';
      const modalTransform = hasCardModal ? '-10px' : transformOffset;
      const toPresentingScale = SwipeToCloseDefaults.MIN_PRESENTING_SCALE;
      const finalTransform = `translateY(${modalTransform}) scale(${toPresentingScale})`;

      presentingAnimation.addElement(presentingEl).keyframes([
        { offset: 0, filter: 'contrast(0.85)', transform: finalTransform, borderRadius: '10px 10px 0 0' },
        { offset: 1, filter: 'contrast(1)', transform: 'translateY(0px) scale(1)', borderRadius: '0px' },
      ]);

      baseAnimation.addAnimation(presentingAnimation);
    } else {
      baseAnimation.addAnimation(backdropAnimation);

      if (!hasCardModal) {
        wrapperAnimation.fromTo('opacity', '1', '0');
      } else {
        const toPresentingScale = hasCardModal ? SwipeToCloseDefaults.MIN_PRESENTING_SCALE : 1;
        const finalTransform = `translateY(-10px) scale(${toPresentingScale})`;

        presentingAnimation
          .addElement(presentingElRoot.querySelector('.modal-wrapper')!)
          .afterStyles({
            transform: 'translate3d(0, 0, 0)',
          })
          .keyframes([
            { offset: 0, filter: 'contrast(0.85)', transform: finalTransform },
            { offset: 1, filter: 'contrast(1)', transform: 'translateY(0) scale(1)' },
          ]);

        const shadowAnimation = createAnimation()
          .addElement(presentingElRoot.querySelector('.modal-shadow')!)
          .afterStyles({
            transform: 'translateY(0) scale(1)',
          })
          .keyframes([
            { offset: 0, opacity: '0', transform: finalTransform },
            { offset: 1, opacity: '1', transform: 'translateY(0) scale(1)' },
          ]);

        baseAnimation.addAnimation([presentingAnimation, shadowAnimation]);
      }
    }
  } else {
    baseAnimation.addAnimation(backdropAnimation);
  }

  return baseAnimation;
};
