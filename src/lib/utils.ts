import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from 'moment';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDatePosted(dateString?: string) {
  console.log('Date passed to formatDatePosted:', dateString);
  if (!dateString) return 'N/A';
  return moment(dateString).fromNow();
}

export function cleanHtml(html: string): string {
  if (!html) return '';
  
  // First, check if the content is already HTML or if it's plain text that needs to be converted
  let processedHtml = html;
  
  // Special handling for Greenhouse HTML content which often has escaped HTML
  if (html.includes('&lt;') && html.includes('&gt;')) {
    // Decode HTML entities first
    processedHtml = html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  
  // If the content doesn't contain proper HTML tags (just text with angle brackets), 
  // we need to ensure it's properly formatted
  if (!processedHtml.includes('<div') && !processedHtml.includes('<section') && processedHtml.includes('<h1>')) {
    // This looks like it might be improperly encoded HTML, let's try to parse it as-is
    processedHtml = processedHtml;
  }
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = processedHtml;
  
  // Remove all Microsoft Word and Greenhouse specific attributes and classes
  const elementsToClean = tempDiv.querySelectorAll('*');
  elementsToClean.forEach(element => {
    // Remove Microsoft Word and Greenhouse specific attributes
    const attributesToRemove = [
      'data-contrast', 'data-ccp-props', 'data-leveltext', 'data-font',
      'data-listid', 'data-list-defn-props', 'data-aria-posinset', 
      'data-aria-level', 'data-start', 'data-end', 'data-pm-slice',
      'data-prosemirror-content-type', 'data-prosemirror-node-name',
      'data-prosemirror-node-block', 'data-prosemirror-mark-name',
      // Greenhouse specific attributes
      'data-entity-type', 'data-entity-id', 'data-uw-styling-context',
      'data-uw-rm-brl', 'data-uw-rm-ext-link', 'data-uw-rm-form'
    ];
    
    attributesToRemove.forEach(attr => {
      element.removeAttribute(attr);
    });
    
    // Remove inline styles except for basic formatting
    const style = element.getAttribute('style');
    if (style) {
      // Keep only basic styles like font-weight, font-size, color
      const allowedStyles = ['font-weight', 'font-size', 'color', 'text-align'];
      const styleObj = style.split(';').reduce((acc, rule) => {
        const [property, value] = rule.split(':').map(s => s.trim());
        if (property && value && allowedStyles.includes(property)) {
          acc[property] = value;
        }
        return acc;
      }, {} as Record<string, string>);
      
      const newStyle = Object.entries(styleObj)
        .map(([prop, val]) => `${prop}: ${val}`)
        .join('; ');
      
      if (newStyle) {
        element.setAttribute('style', newStyle);
      } else {
        element.removeAttribute('style');
      }
    }
    
    // Remove problematic class names (Greenhouse specific)
    const classAttr = element.getAttribute('class');
    if (classAttr) {
      const cleanedClasses = classAttr
        .split(' ')
        .filter(cls => !cls.startsWith('ak-') && !cls.includes('prosemirror') && cls.trim() !== '')
        .join(' ');
      
      if (cleanedClasses) {
        element.setAttribute('class', cleanedClasses);
      } else {
        element.removeAttribute('class');
      }
    }
    
    // Remove empty class attributes
    if (element.getAttribute('class') === '') {
      element.removeAttribute('class');
    }
  });
  
  // Remove Greenhouse specific wrapper divs that add no value
  const greenhouseDivs = tempDiv.querySelectorAll('div.content-intro, div.content-conclusion');
  greenhouseDivs.forEach(div => {
    // Move children out of the wrapper div
    while (div.firstChild) {
      div.parentNode?.insertBefore(div.firstChild, div);
    }
    div.remove();
  });
  
  // Clean up empty paragraphs and normalize spacing
  const paragraphs = tempDiv.querySelectorAll('p');
  paragraphs.forEach(p => {
    if (p.textContent?.trim() === '' || p.innerHTML.trim() === '&nbsp;') {
      p.remove();
    }
  });
  
  // Convert multiple consecutive ul elements into a single ul
  const lists = tempDiv.querySelectorAll('ul');
  lists.forEach((ul, index) => {
    const nextSibling = ul.nextElementSibling;
    if (nextSibling && nextSibling.tagName === 'UL') {
      // Move all li elements from next ul to current ul
      while (nextSibling.firstChild) {
        ul.appendChild(nextSibling.firstChild);
      }
      nextSibling.remove();
    }
  });
  
  // Add proper spacing classes for better readability
  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    heading.className = 'text-xl font-bold mt-6 mb-3 first:mt-0 text-gray-900 dark:text-white';
    // Different sizes for different heading levels
    if (heading.tagName === 'H1') {
      heading.className = 'text-2xl font-bold mt-6 mb-4 first:mt-0 text-gray-900 dark:text-white';
    } else if (heading.tagName === 'H2') {
      heading.className = 'text-xl font-bold mt-6 mb-3 first:mt-0 text-gray-900 dark:text-white';
    } else if (heading.tagName === 'H3') {
      heading.className = 'text-lg font-semibold mt-5 mb-3 first:mt-0 text-gray-900 dark:text-white';
    } else {
      heading.className = 'text-base font-semibold mt-4 mb-2 first:mt-0 text-gray-900 dark:text-white';
    }
  });
  
  const paragraphsAfterClean = tempDiv.querySelectorAll('p');
  paragraphsAfterClean.forEach(p => {
    if (!p.className) {
      p.className = 'mb-4 text-gray-700 dark:text-gray-300 leading-relaxed';
    }
  });
  
  const listsAfterClean = tempDiv.querySelectorAll('ul');
  listsAfterClean.forEach(ul => {
    ul.className = 'list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300';
    const listItems = ul.querySelectorAll('li');
    listItems.forEach(li => {
      li.className = 'ml-4 leading-relaxed';
    });
  });
  
  // Style emphasis elements
  const strongElements = tempDiv.querySelectorAll('strong');
  strongElements.forEach(strong => {
    strong.className = 'font-semibold text-gray-900 dark:text-white';
  });
  
  const emElements = tempDiv.querySelectorAll('em');
  emElements.forEach(em => {
    em.className = 'italic text-gray-600 dark:text-gray-400';
  });
  
  // Handle pay transparency section specially (Greenhouse specific)
  const paySection = tempDiv.querySelector('.content-pay-transparency');
  if (paySection) {
    paySection.className = 'mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700';
    
    // Clean up nested pay input structure
    const payInput = paySection.querySelector('.pay-input');
    if (payInput) {
      const description = payInput.querySelector('.description');
      const title = payInput.querySelector('.title');
      const payRange = payInput.querySelector('.pay-range');
      
      // Move content out of nested structure
      if (description) {
        while (description.firstChild) {
          paySection.appendChild(description.firstChild);
        }
        description.remove();
      }
      
      if (title) {
        title.className = 'text-lg font-semibold mb-2 text-gray-900 dark:text-white mt-4';
        paySection.appendChild(title);
      }
      
      if (payRange) {
        payRange.className = 'text-xl font-bold text-green-600 dark:text-green-400 mb-3';
        paySection.appendChild(payRange);
      }
      
      payInput.remove();
    }
    
    // Fallback for simpler structure
    const payTitle = paySection.querySelector('.title');
    if (payTitle) {
      payTitle.className = 'text-lg font-semibold mb-2 text-gray-900 dark:text-white';
    }
    const payRange = paySection.querySelector('.pay-range');
    if (payRange) {
      payRange.className = 'text-xl font-bold text-green-600 dark:text-green-400 mb-3';
    }
  }
  
  return tempDiv.innerHTML;
} 