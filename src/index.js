/* eslint-disable react/prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

// Slomux — упрощённая, сломанная реализация Flux.
// Перед вами небольшое приложение, написанное на React + Slomux.
// Это нерабочий секундомер с настройкой интервала обновления.

// Исправьте ошибки и потенциально проблемный код, почините приложение и прокомментируйте своё решение.

// При нажатии на "старт" должен запускаться секундомер и через заданный интервал времени увеличивать свое значение на значение интервала
// При нажатии на "стоп" секундомер должен останавливаться и сбрасывать свое значение

const createStore = (reducer, initialState = {
  currentInterval: 1
}) => {
  let currentState = initialState
  const listeners = []

  const getState = () => currentState
  const dispatch = (action) => {
    currentState = reducer(currentState, action)
    listeners.forEach((listener) => listener())
  }

  const subscribe = (listener) => listeners.push(listener)

  return { getState, dispatch, subscribe }
}

const connect = (mapStateToProps, mapDispatchToProps) => (Component) => {
  class WrappedComponent extends React.Component {
    render() {
      return (
        <Component
          {...this.props}
          {...mapStateToProps(this.context.store.getState(), this.props)}
          {...mapDispatchToProps(this.context.store.dispatch, this.props)}
        />
      )
    }

    componentDidUpdate() {
      this.context.store.subscribe(this.handleChange)
    }

    handleChange = () => {
      this.forceUpdate()
    };
  }

  WrappedComponent.contextTypes = {
    store: PropTypes.object,
  }

  return WrappedComponent
}

class Provider extends React.Component {
  getChildContext() {
    return {
      store: this.props.store,
    }
  }

  render() {
    return React.Children.only(this.props.children)
  }
}

Provider.childContextTypes = {
  store: PropTypes.object,
}

// APP

// actions
const CHANGE_INTERVAL = 'CHANGE_INTERVAL'

// action creators
const changeInterval = (value) => ({
  type: CHANGE_INTERVAL,
  payload: value,
})

// reducers
const reducer = (state, action) => {
  switch (action.type) {
  case CHANGE_INTERVAL:
    return {
      ...state,
      currentInterval: (state.currentInterval === 1 && action.payload < 0) ? state.currentInterval : state.currentInterval + action.payload
    }
  default:
    return {
      ...state
    }
  }
}

// components

class IntervalComponent extends React.Component {
  render() {
    return (
      <div>
        <span>
          Интервал обновления секундомера: {this.props.currentInterval} сек.
        </span>
        <span>
          <button onClick={() => this.props.changeInterval(-1)}>-</button>
          <button onClick={() => this.props.changeInterval(1)}>+</button>
        </span>
      </div>
    )
  }
}

const Interval = connect(
  (state) => {
    return {
      currentInterval: state.currentInterval,
    }
  },
  (dispatch) => ({
    changeInterval: (value) => dispatch(changeInterval(value)),
  })
)(IntervalComponent)

class TimerComponent extends React.Component {
  state = {
    currentTime: 0,
  }

  componentDidMount() {
    this.forceUpdate()
  }

  interval = 0

  render() {
    console.log(this.props)
    return (
      <div style={{ paddingTop: '100px' }}>
        <Interval />
        <div>Секундомер: {this.state.currentTime} сек.</div>
        <div>
          <button onClick={this.handleStart}>Старт</button>
          <button onClick={this.handleStop}>Стоп</button>
          {this.props.currentInterval}
        </div>
      </div>
    )
  }

  handleStart = () => {
    clearInterval(this.interval)
    this.interval = setInterval(
      () =>
        this.setState(state => {
          return {
            currentTime: state.currentTime + this.props.currentInterval,
          }
        }),
      this.props.currentInterval * 1000
    )
  }

  handleStop = () => {
    clearInterval(this.interval)
    this.setState({ currentTime: 0 })
  }
}

const Timer = connect(
  (state) => ({
    currentInterval: state.currentInterval,
  }),
  () => { }
)(TimerComponent)

// init
ReactDOM.render(
  <Provider store={createStore(reducer)}>
    <Timer />
  </Provider>,
  document.getElementById('root')
)
