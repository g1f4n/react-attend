/*!

=========================================================
* Light Bootstrap Dashboard React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { Component } from 'react';
import {
	Container,
	Row,
	Col,
	FormGroup,
	ControlLabel,
	FormControl,
	Form,
	Tooltip,
	OverlayTrigger,
	Table
} from 'react-bootstrap';

import { Card } from 'components/Card/Card.jsx';
import { FormInputs } from 'components/FormInputs/FormInputs.jsx';
import { UserCard } from 'components/UserCard/UserCard.jsx';
import Button from 'components/CustomButton/CustomButton.jsx';

import avatar from 'assets/img/faces/face-3.jpg';
import Axios from 'axios';
import { baseurl } from 'utils/baseurl';
import Parse, { User } from 'parse';
import ModalHandler from './Category/ModalHandler';
import moment from 'moment';
import DateTime from 'react-datetime';
import { Link } from 'react-router-dom';
import { handleConvert } from 'utils/converter';
import { slicename } from 'utils/slicename';

class EarlyLeave extends Component {
	constructor(props) {
		super(props);
		this.state = {
			trainee: [],
			leave: [],
			user: [],
			data: [],
			error: '',
			userId: '',
			fullnames: '',
			imageSelfies: '',
			times: '',
			reasons: '',
			userIndex: 0,
			status: 3,
			loading: false,
			addMode: false,
			editMode: false,
			deleteMode: false,
			buttonLoading: false
		};

		this.handleSearch = this.handleSearch.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleApprove = this.handleApprove.bind(this);
		this.handleReject = this.handleReject.bind(this);
		this.handleFilter = this.handleFilter.bind(this);

	}

	componentDidMount() {
		this.getTrainee();
		this.getUser();
	}

	getTrainee() {
		this.setState({ loading: true });
		const Leave = Parse.Object.extend('EarlyLeave');
		const Leader = Parse.Object.extend('Leader');
		const leader = new Leader();
		const query = new Parse.Query(Leave);

		console.log(Parse.User.current().get('leaderId').id);

		leader.id = Parse.User.current().get('leaderId').id;
		query.equalTo('leaderId', leader);
		query.equalTo('status', 3);
		query.find().then((x) => {
			console.log(x);
			this.setState({ leave: x, loading: false });
		});
	}

	// get user
	getUser() {
		this.setState({ loading: true });
		const User = Parse.Object.extend('User');
		const Leader = Parse.Object.extend('Leader');
		const leader = new Leader();
		const query = new Parse.Query(User);

		console.log(Parse.User.current().get('leaderId').id);

		leader.id = Parse.User.current().get('leaderId').id;
		query.equalTo('leaderId', leader);
		query.equalTo('roles', 'staff');
		query.find().then((x) => {
			console.log(x);
			this.setState({ user: x, loading: false });
		});
	}

	handleFilter(e) {
		e.preventDefault();
		this.setState({ loading: true });
		console.log(this.state.status);

		const leave = Parse.Object.extend('EarlyLeave');
		const Leader = Parse.Object.extend('Leader');
		const leader = new Leader();
		const query = new Parse.Query(leave);

		console.log(Parse.User.current().get('leaderId').id);

		leader.id = Parse.User.current().get('leaderId').id;
		query.equalTo('leaderId', leader);
		query.equalTo('status', parseInt(this.state.status));
		query.find().then((x) => {
			console.log(x);
			this.setState({ leave: x, loading: false });
		});
	}

	handleApprove(e) {
		this.setState({ loading: true });
		const leave = Parse.Object.extend('EarlyLeave');
		const query = new Parse.Query(leave);

		query.get(this.state.userId).then((x) => {
			x.set('status', 1);
			x.save().then(() => {
				const newOvertime = [...this.state.leave];
				newOvertime.splice(this.state.userIndex, 1);
				this.setState({
					leave: newOvertime,
					editMode: false,
					loading: false
				});
			});
		});
	}
	handleReject(e) {
		this.setState({ loading: true });
		const leave = Parse.Object.extend('EarlyLeave');
		const query = new Parse.Query(leave);

		query.get(this.state.userId).then((x) => {
			x.set('status', 0);
			x.save().then(() => {
				const newOvertime = [...this.state.leave];
				newOvertime.splice(this.state.userIndex, 1);
				this.setState({
					leave: newOvertime,
					deleteMode: false,
					loading: false
				});
			});
		});
	}

	handleEdit(id) {
		const User = new Parse.User();
		const query = new Parse.Query(User);

		// Finds the user by its ID
		query
			.get(id)
			.then((user) => {
				// Updates the data we want
				this.setState({
					traineeId: id,
					editMode: true,
					username: user.get('username'),
					email: user.get('email'),
					dob: user.get('dateOfBirth'),
					pob: user.get('placeOfBirth'),
					phoneNumber: user.get('phoneNumber'),
					fullname: user.get('fullname'),
					batch: user.get('batch')
				});
			})
			.catch((err) => console.log(err));
	}

	handleUpdate(e) {
		e.preventDefault();

		this.setState({ loading: true });

		const {
			username,
			email,
			password,
			passwordConf,
			dob,
			pob,
			phoneNumber,
			fullname,
			batch,
			profile
		} = this.state;

		const User = new Parse.User();
		const query = new Parse.Query(User);

		query.get(this.state.traineeId).then((user) => {
			user.set('username', `${username}-batch${batch}`);
			user.set('email', email);
			if (profile !== '') user.set('profile', new Parse.File('profile.jpg', profile));
			user.set('dateOfBirth', dob);
			user.set('placeOfBirth', pob);
			user.set('phoneNumber', phoneNumber);
			user.set('role', 'trainee');
			user.set('fullname', fullname);
			user.set('batch', parseInt(batch));
			user.set('status', 1);
			user.set('password', password);
			user.set('out', false);
			user.save().then((z) => {
				this.setState({ loading: false });
				window.location.reload(false);
			});
		});
	}

	handleDelete() {
		this.setState({ loading: true });
		const User = new Parse.User();
		const query = new Parse.Query(User);

		query.get(this.state.traineeId).then((x) => {
			x.set('status', 0);
			x.save().then((z) => {
				this.setState({ late: z, loading: false });
				window.location.reload(false);
			});
		});
	}

	handleSearch(e) {
		e.preventDefault();

		console.log(this.state.batch);

		this.setState({ loading: true });

		const data = {
			batch: this.state.batch
		};

		Axios.post(baseurl('trainee/batch'), data)
			.then((x) => {
				console.log(x.data);
				this.setState({ trainee: x.data, loading: false });
			})
			.catch((err) => this.setState({ error: err, loading: false }));
	}


	render() {
		const { leave, error, loading, batch, setLeaveState } = this.state;

		// setLeaveState(leave.map(d => {
		// 	return {
		// 		select: false,
		// 		id: d.id,
		// 		status: d.status
		// 	};
		// }));

		// const { user, error, loading } = this.state;
		// const id = this.props.match.params.id;
		const {
			username,
			email,
			password,
			passwordConf,
			dob,
			pob,
			phoneNumber,
			fullname,
			profile
		} = this.state;
		const tooltip = (msg) => <Tooltip id="button-tooltip">{msg}</Tooltip>;

		return (
			<div className="content">
				<ModalHandler
					show={this.state.deleteMode}
					title="Reject confirmation"
					handleHide={() => this.setState({ deleteMode: false })}
					handleSave={this.handleReject}
					loading={this.state.loading}
					body={'Reject request ' + this.state.fullnames + ' ?'}
				/>
				<ModalHandler
					show={this.state.editMode}
					title="Approve confirmation"
					handleSave={this.handleApprove}
					loading={this.state.loading}
					handleHide={() => this.setState({ editMode: false })}
					body={'Approve request ' + this.state.fullnames + ' ?'}
				/>
				<ModalHandler
					show={this.state.approveAllMode}
					title="Approve All Confirmation"
					loading={this.state.loading}
					handleHide={() => this.setState({ approveAllMode: false })}
					body={'List Approve' + this.state.data + ' ?'}
				/>
				<ModalHandler
					show={this.state.detailMode}
					title="Detail Employee"
					loading={this.state.loading}
					handleHide={() => this.setState({ detailMode: false })}
					body={
						<UserCard
							bgImage={
								<img
									src="https://ununsplash.imgix.net/photo-1431578500526-4d9613015464?fit=crop&fm=jpg&h=300&q=75&w=400"
									alt="..."
								/>
							}
							avatar={(this.state.imageSelfies)}
						/>
					}
				/>
				<Container fluid>
					<Row>
						<Col md={12}>
							<Card
								title="List Employee"
								ctTableFullWidth
								ctTableResponsive
								content={
									<div>
										<Row>
											<Col>
												<Form
													onSubmit={this.handleFilter}
													style={{ marginBottom: '20px' }}
												>
													<Form.Group
														as={Row}
														controlId="formHorizontalEmail"
													>
														<Col sm={2}>
															<p>Search by name</p>
														</Col>
														<Col
															sm={{ span: 2 }}
															className="pull-right"
														>
															<Form.Control
																as="select"
																// defaultValue={1}
																onChange={(e) => {
																	console.log(e.target.value);
																	this.setState({
																		status: e.target.value
																	});
																}}
															>
																{[3, 1, 0].map((x) => (
																	<option value={x}>
																		{handleConvert(x)}
																	</option>
																))}
															</Form.Control>
														</Col>
														<Col sm={{ span: 2 }}>
															<Button
																variant="primary"
																type="submit"
																disable={loading ? 'true' : 'false'}
															>
																<i className="fa fa-search" />{' '}
																{loading ? 'Fetching...' : 'Search'}
															</Button>
														</Col>
													</Form.Group>
													<Col sm={{ span: 0 }} className="float-none">
														<Button className="m-1">
															<i className="fa fa-check"></i> Approve All
															</Button>
														<Button className="m-1">
															<i className="fa fa-close"></i> Reject All
															</Button>
													</Col>
												</Form>
											</Col>

											<Col md={12} sm={12} lg={12}>
												<Table striped hover>
													<thead>
														<tr>
															<OverlayTrigger placement="right" overlay={tooltip("Check all")}><th scope="col"><input type="checkbox" onChange={(e) => {
																let checked = e.target.checked;
																// setLeaveState(leave.map(d => {
																// 	d.select = checked;
																// 	return d;
																// }));
																this.setState(leave.map((d) => {
																	d.select = checked;
																	d.status = d.get('status');
																	return d;
																}));
															}} /></th></OverlayTrigger>
															<th>No</th>
															<th>Full Name</th>
															<th>Time</th>
															<th>Reason</th>
															<th>Action</th>
														</tr>
													</thead>
													<tbody key={1}>
														{leave.length < 1 ? <tr><td>No data found</td></tr> : leave.map((prop, key) => (
															<tr>
																<td scope="row"><input onChange={(event) => {
																	let checked = event.target.checked;
																	// setLeaveState(leave.map((data) => {
																	// 	if (prop.id === data.id) {
																	// 		data.select = checked;
																	// 	}
																	// 	return data;
																	// }));
																	this.setState(leave.map((data) => {
																		if (prop.id === data.id) {
																			data.select = checked;
																			data.status = prop.get('status');
																		}
																		return data;
																		// console.log(data.status);
																	}));
																}} type="checkbox" checked={prop.select} /></td>
																<td>{key + 1}</td>
																<td>{prop.get('fullname')}</td>
																<td>{moment(prop.get('time')).format('DD/MM/YYYY [at] HH:mm:ss')}</td>
																<td>{prop.get('alasan')}</td>
																<td out>
																	{/* {prop.get('status') === 3 ? 'gagal' : 'berhasil'} */}
																	<OverlayTrigger placement="right" overlay={tooltip("Detail")}>
																		<Button className="btn btn-circle" onClick={() => {
																			this.setState({
																				detailMode: true,
																				// userId: prop.id,
																				// userIndex: i,
																				imageSelfies: prop.get('imageSelfie') === undefined ? ('https://ununsplash.imgix.net/photo-1431578500526-4d9613015464?fit=crop&fm=jpg&h=300&q=75&w=400') : (prop.attributes.imageSelfie.url()),
																				times: prop.get('time'),
																				fullnames: prop.get('fullname'),
																				status: prop.get('status'),
																				descIzin: prop.get('descIzin'),
																				reasons: prop.get('alasan')
																			});
																		}}>
																			<i className="fa fa-eye"></i>
																		</Button>
																	</OverlayTrigger>{' '}

																	<OverlayTrigger placement="right" overlay={tooltip('Approve')}>
																		<Button className="btn btn-circle" onClick={() => {
																			this.setState({
																				editMode: true,
																				userId: prop.id,
																				userIndex: key,
																				fullnames: prop.get(
																					'fullname'
																				)
																			});
																		}}>
																			<i className="fa fa-check" />
																		</Button>
																	</OverlayTrigger>{' '}

																	<OverlayTrigger placement="right" overlay={tooltip('Reject')}>
																		<Button className="btn btn-circle" onClick={(e) => {
																			this.setState({
																				deleteMode: true,
																				userId: prop.id,
																				userIndex: key,
																				fullnames: prop.get(
																					'fullname'
																				)
																			});
																		}}>
																			<i className="fa fa-close" />
																		</Button>
																	</OverlayTrigger>{' '}
																</td>
															</tr>
														))}
													</tbody>
												</Table>
											</Col>
										</Row>
										<Row>

											{/* {leave.length < 1 ? (
												<Col md={12}>No data found...</Col>
											) : (
													leave.map((x, i) => (
														<Col md={3}>
															<UserCard
																out={x.status}
																bgImage={
																	<img
																		src="https://ununsplash.imgix.net/photo-1431578500526-4d9613015464?fit=crop&fm=jpg&h=300&q=75&w=400"
																		alt="..."
																	/>
																}
																avatar={
																	x.attributes.imageSelfie ==
																		undefined ? (
																			'https://ununsplash.imgix.net/photo-1431578500526-4d9613015464?fit=crop&fm=jpg&h=300&q=75&w=400'
																		) : (
																			x.attributes.imageSelfie.url()
																		)
																}
																name={slicename(x.get('fullname'))}
																userName={x.get('descIzin')}
																description={
																	<span>
																		<span>
																			<strong>
																				Absen masuk:
																		</strong>
																			<br />
																			{moment(
																				x.get('time')
																			).format(
																				'DD/MM/YYYY [at] HH:mm:ss'
																			)}
																		</span>
																		<br />
																		<span>
																			<strong>
																				Late reason:
																		</strong>
																			<br />
																			{x.get('alasan')}
																		</span>
																	</span>
																}
																status={x.get('status')}
																socials={
																	<div>
																		<OverlayTrigger
																			placement="right"
																			overlay={tooltip('Approve')}
																		>
																			<Button
																				simple
																				onClick={() => {
																					this.setState({
																						editMode: true,
																						userId: x.id,
																						userIndex: i,
																						fullnames: x.get(
																							'fullname'
																						)
																					});
																				}}
																			>
																				<i className="fa fa-check" />
																			</Button>
																		</OverlayTrigger>
																		<OverlayTrigger
																			placement="right"
																			overlay={tooltip('Reject')}
																		>
																			<Button
																				simple
																				onClick={(e) => {
																					this.setState({
																						deleteMode: true,
																						userId: x.id,
																						userIndex: i,
																						fullnames: x.get(
																							'fullname'
																						)
																					});
																				}}
																			>
																				<i className="fa fa-close" />
																			</Button>
																		</OverlayTrigger>
																	</div>
																}
															/>
														</Col>
													))
												)} */}
										</Row>
									</div>
								}
							/>
						</Col>
					</Row>

					{/* </Col> */}
					{/* </Row> */}
				</Container>
			</div>
		);
	}
}

export default EarlyLeave;
