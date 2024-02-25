// Import statements bring necessary modules and styles into the file.
// React and Component are imported for creating the class component.
// Table and TableData types are imported from '@finos/perspective' for handling table operations.
// ServerRespond type is imported for prop type definition.
// DataManipulator is a utility class for data transformation.
// Graph.css contains styling specific to this component.
import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

// IProps interface defines the props expected by the Graph component, specifically an array of ServerRespond objects.
interface IProps {
  data: ServerRespond[],
}

// PerspectiveViewerElement interface extends HTMLElement to include the load method specific to Perspective viewers.
interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}

// Graph class component is declared, inheriting from React.Component and utilizing IProps for props type.
class Graph extends Component<IProps, {}> {
  // table property is declared to hold the Perspective table instance, initially undefined.
  table: Table | undefined;

  // render method returns a Perspective viewer element, created programmatically.
  render() {
    return React.createElement('perspective-viewer');
  }

  // componentDidMount lifecycle method is used for initialization tasks after the component mounts.
  componentDidMount() {
    // Retrieves the Perspective viewer element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    // Defines the schema for the Perspective table, specifying data types for financial metrics.
    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
    };

    // Initializes the Perspective table using a worker, if available.
    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    // Loads the table into the Perspective viewer and sets its configuration for visualization.
    if (this.table) {
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio","lower_bound","upper_bound","trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  // componentDidUpdate lifecycle method is used to update the Perspective table when the component's props change.
  componentDidUpdate() {
    // Checks if the table exists before attempting to update it with new data.
    if (this.table) {
      // Updates the table with new data transformed by the DataManipulator.
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData);
    }
  }
}

// Exports the Graph component for use elsewhere in the application.
export default Graph;
