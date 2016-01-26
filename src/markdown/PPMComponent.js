import React, { PropTypes } from 'react';
import MDReactComponent from './MDReactComponent';

import abbr from 'markdown-it-abbr';
import emoji from 'markdown-it-emoji';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import container from 'markdown-it-container';
import ppm from './markdown-it-ppm';

import {parsePluginString} from '../utils/parsePlugins';
import Plugins from '../components/EditorPluginsNew/index';
import InputFields from '../components/EditorPluginFields/index';

const PPMComponent = React.createClass({
	propTypes: {
		markdown: PropTypes.string,
		assets: PropTypes.array,
		references: PropTypes.array,
	},

	getDefaultProps: function() {
		return {
			markdown: '',
			assets: [],
			references: [],
		};
	},

  handleIterate: function(Tag, props, children) {

		let Component = Tag;

    switch(Tag) {
    case 'table':
      props.className = 'table table-striped';
      break;
    case 'div':
    	if (props['data-info']) {
    		props.className = props.className ? props.className + props['data-info'] : props['data-info'];
    	}
      break;
    case 'ppm':
      props.className = 'ppm';
      if (children.length > 1) {
        console.log('This shouldnt happen!!');
      }
			const pluginName = children[0].split(':')[0];
			const plugin = Plugins[pluginName];
			if (!plugin) {
				console.warn('Could not find a plugin');
				return <span {...props}>{children}</span>;
			}

      Component = plugin.Component;
			const PluginInputFields = plugin.InputFields;
			const pluginString = children[0];
      const pluginProps = parsePluginString(pluginString);

      for (const propName in pluginProps) {
				const propVal = pluginProps[propName];
				const pluginInputField = PluginInputFields.find( field => field.title === propName);
        if (pluginInputField) {
          let inputVal = pluginProps[propName];
					const InputFieldType = pluginInputField.type;
					const Field = InputFields[InputFieldType];
          if (InputFields[InputFieldType].transform) {
            pluginProps[propName] = InputFields[InputFieldType].transform(propVal, pluginInputField.params, this.props.assets, this.props.references);
					}
        }
      }

      return <Component {...pluginProps}/>;
      break;
    case 'code':
      if (props['data-language']) {
        return <Tag {...props} dangerouslySetInnerHTML={{__html: window.hljs.highlight(props['data-language'], children[0]).value}} />
      };
      break;
		case 'p':
			props.className = 'p-block';
			Component = 'div';
			break;
    }
    return <Component {...props}>{children}</Component>;
  },

	render: function() {
		return (
			<MDReactComponent text={this.props.markdown}
				onIterate={this.handleIterate}
				markdownOptions={{
					typographer: true,
					linkify: true,
				}}
				plugins={[
					abbr,
					emoji,
					sub,
					sup,
					{plugin: container, args: ['blank', {validate: ()=>{return true;}}]},
          			ppm
				]} />
		);
	}
});

export default PPMComponent;