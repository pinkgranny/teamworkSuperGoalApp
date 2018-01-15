import React from "react"
import uuid from "uuid/v4"
import { BrowserRouter, Route } from "react-router-dom"
import MainScreen from "./mainScreen"
import SetSuperGoalScreen from "./setSuperGoalScreen"
import Header from "./header"

export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      superGoal: { // start the App with an empty supergoal
        name: "",
        value: null
      },
      taskList: [] // start the app with an empty array
    }
  }

  componentWillMount() {
    if (localStorage.getItem("superGoalAppData")) { // checking if there is a localstorage for this app
      this.setState(JSON.parse(localStorage.getItem("superGoalAppData")))
    }
  }
  // Here we parse (change the string back to an object) the localstorage from addTaskToList

  updateSuperGoal = (newSuperGoalName, newSuperGoalValue) => {
    this.setState({
      superGoal: {
        name: newSuperGoalName,
        value: parseFloat(newSuperGoalValue)
      }
    }, () => { localStorage.setItem("superGoalAppData", JSON.stringify(this.state)) })
  }
  // As JavaScript is asynchronous, we need to add the funcion as a second argument to setState
  // to make sure it is run after the state is updated
  // as the newly updated object needs to be used

  addTaskToList = (taskName, taskTimes, taskValue) => {
    const taskObject = {
      id: uuid(),
      name: taskName,
      times: parseFloat(taskTimes),
      value: taskValue,
      counter: 0
    }
    this.setState(prevState => ({ // using prevState we make sure that when we update our state
      // with a new object, we base that object to the previous state to ensure
      // we don't use the wrong values...
      taskList: [taskObject, ...prevState.taskList]
    }), () => { localStorage.setItem("superGoalAppData", JSON.stringify(this.state)) }) // ...to make sure that we always have the latest state here as this.state
    // At the start of array taskList, add a new object
    // The object needs to be stringified to be able to be saved in the state.
  }

  removeTaskFromList = taskId => {
    this.setState({
      taskList: this.state.taskList.filter(item => ( // FIX: prevState
        item.id !== taskId // Filter creates a new array containing items that
        // match this condition
      ))
    }, () => { localStorage.setItem("superGoalAppData", JSON.stringify(this.state)) })
  }

  // This function updates the counter and also, if this was the last "done iteration" (x/x),
  // it moves the task to the bottom of the array
  updateCounter = id => { // Function receives the id of the object
    // that shall be updated
    let indexToMove = null
    let updatedListOfTasks = this.state.taskList.map((item, index) => {
      if (item.id === id) {
        if (item.counter + 1 === item.times) {
          indexToMove = index
          item.counter += 1
        } else {
          item.counter += 1
        }
      }
      return item
    })
    if (indexToMove !== null) {
      updatedListOfTasks = updatedListOfTasks.concat(updatedListOfTasks.splice(indexToMove, 1))
    // HERE FOLLOWS THE LONGER VERSION OF THE SINGLE LINE OF CODE ABOVE:
    // first the one item in the array is found and removed from the
    // original array with "splice" and put "on the side"
    // const arrayContainingTheitemToRemoveFromOriginalArray = updatedListOfTasks.splice(indexToMove, 1)
    // then we merge the two arrays using "concat"
    // updatedListOfTasks = updatedListOfTasks.concat(arrayContainingTheitemToRemoveFromOriginalArray)
    }
    this.setState({
      taskList: updatedListOfTasks
    }, () => { localStorage.setItem("superGoalAppData", JSON.stringify(this.state)) })
  }

  countTotalEarnings = () => {
    let totalEarningsCounter = 0 // Start a counter at 0
    this.state.taskList.forEach(item => { // For each item in the tasklist
      totalEarningsCounter += (item.value * item.counter) // Add the earnings
      // for the item to the totalEarningsCounter
    })
    return totalEarningsCounter // Return the value of the totalEarningsCounter
  }

  countPercentageOfSupergoal = () => (
    ((this.countTotalEarnings() / this.state.superGoal.value) * 100)
  )

  render() {
    return (
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <div className="App">
          <Header />

          <Route
            exact
            path="/" // if the URL matches '/' exactly
            render={() => { // then render
              if (this.state.superGoal.value === null) { // if there is no superGoal
                return <SetSuperGoalScreen // then display the SetSuperGoalScreen
                  currentSuperGoal={this.state.superGoal}
                  updateSuperGoalInApp={this.updateSuperGoal} /> // the callback function located
                // in this component, will be invoked
                // when the superGoal is setup
              } else { // else display the MainScreen
                return <MainScreen
                  taskList={this.state.taskList} // pass on the last update of
                  // the taskList (in the state) in the props
                  doneButtonWasClicked={this.updateCounter} // these callback functions
                  // are located in this component. They are passed on as props.
                  deleteButtonWasClicked={this.removeTaskFromList}
                  countTotalEarnings={this.countTotalEarnings}
                  countPercentageOfSupergoal={this.countPercentageOfSupergoal}
                  showTwoDecimals={this.showTwoDecimals}
                  superGoalName={this.state.superGoal.name}
                  superGoalValue={this.state.superGoal.value}
                  addTaskToList={this.addTaskToList} />
              }
            }
            } />

          {/* This is now out of scope */}
          {/* <Route
            exact
            path="/set-supergoal" // the URL used if the user wants to update her SuperGoal
            render={() =>
              <SetSuperGoalScreen
            currentSuperGoal={this.state.superGoal}
            updateSuperGoalInApp={this.updateSuperGoal} />
          } /> */}

        </div>
      </BrowserRouter>
    )
  }
}
