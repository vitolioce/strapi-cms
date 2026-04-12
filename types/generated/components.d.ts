import type { Schema, Struct } from '@strapi/strapi';

export interface ElementsCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_cards';
  info: {
    displayName: 'Card';
    icon: 'id-card';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    link_label: Schema.Attribute.String;
    link_url: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ElementsColumn extends Struct.ComponentSchema {
  collectionName: 'components_elements_columns';
  info: {
    displayName: 'Column';
    icon: 'layout';
  };
  attributes: {
    background_color: Schema.Attribute.String;
    content: Schema.Attribute.Blocks;
    image: Schema.Attribute.Media<'images'>;
    text_alignment: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    title: Schema.Attribute.String;
    vertical_alignment: Schema.Attribute.Enumeration<
      ['start', 'center', 'end']
    > &
      Schema.Attribute.DefaultTo<'start'>;
    width_override: Schema.Attribute.Enumeration<
      [
        'auto',
        'col-2',
        'col-3',
        'col-4',
        'col-5',
        'col-6',
        'col-7',
        'col-8',
        'col-9',
        'col-10',
        'col-12',
      ]
    > &
      Schema.Attribute.DefaultTo<'auto'>;
  };
}

export interface SectionsCardsGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_cards_grids';
  info: {
    displayName: 'Cards Grid';
    icon: 'th';
  };
  attributes: {
    cards: Schema.Attribute.Component<'elements.card', true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsCtaBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_cta_banners';
  info: {
    displayName: 'CTA Banner';
    icon: 'bullhorn';
  };
  attributes: {
    background_color: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#0d6efd'>;
    button_label: Schema.Attribute.String;
    button_url: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    text_color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#ffffff'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    displayName: 'Hero';
    icon: 'landscape';
  };
  attributes: {
    background_color: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#f8f9fa'>;
    cta_label: Schema.Attribute.String;
    cta_url: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsImageText extends Struct.ComponentSchema {
  collectionName: 'components_sections_image_texts';
  info: {
    displayName: 'Image + Text';
    icon: 'image';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    image_position: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    text: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
  };
}

export interface SectionsRow extends Struct.ComponentSchema {
  collectionName: 'components_sections_rows';
  info: {
    displayName: 'Row';
    icon: 'layout';
  };
  attributes: {
    background_color: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#ffffff'>;
    columns: Schema.Attribute.Component<'elements.column', true>;
    columns_layout: Schema.Attribute.Enumeration<
      [
        '1-col',
        '2-col-equal',
        '2-col-1-3',
        '2-col-2-3',
        '3-col-equal',
        '4-col-equal',
      ]
    > &
      Schema.Attribute.DefaultTo<'2-col-equal'>;
    padding_y: Schema.Attribute.Enumeration<
      ['none', 'small', 'medium', 'large']
    > &
      Schema.Attribute.DefaultTo<'medium'>;
  };
}

export interface SectionsTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_text_blocks';
  info: {
    displayName: 'Text Block';
    icon: 'file-alt';
  };
  attributes: {
    alignment: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    content: Schema.Attribute.Blocks;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'elements.card': ElementsCard;
      'elements.column': ElementsColumn;
      'sections.cards-grid': SectionsCardsGrid;
      'sections.cta-banner': SectionsCtaBanner;
      'sections.hero': SectionsHero;
      'sections.image-text': SectionsImageText;
      'sections.row': SectionsRow;
      'sections.text-block': SectionsTextBlock;
    }
  }
}
