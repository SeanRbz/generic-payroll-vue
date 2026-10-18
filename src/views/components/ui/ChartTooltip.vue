<template>
  <!--
    Enhances hover and focus only: every value it shows is also a visible label or in the table view.
    Place it inside an ancestor that is `relative group/mark`, which positions it and shows it.
  -->
  <span
    aria-hidden="true"
    class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-sm bg-inverse-surface px-2 py-1 font-label-code text-label-code whitespace-nowrap text-inverse-on-surface shadow-sm group-hover/mark:block group-focus-visible/mark:block"
  >
    <slot />
  </span>
</template>
