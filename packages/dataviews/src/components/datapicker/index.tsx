/**
 * WordPress dependencies
 */
import {
	useCallback,
	useContext,
	useRef,
	useState,
	useMemo,
} from '@wordpress/element';
import { useMergeRefs, useResizeObserver } from '@wordpress/compose';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useFilters } from '../dataviews-filters';
import { normalizeFields } from '../../normalize-fields';
import type { Field, SupportedLayouts, View } from '../../types';
import type { SetSelection, SelectionOrUpdater } from '../../private-types';
import DataViewsContext from '../dataviews-context';
import DataViews from '../dataviews';
import DataPickerGridLayout from './grid-layout';

type DataPickerProps< Item > = {
	/**
	 * Whether the picker allows multiple selections.
	 */
	multiple?: boolean;

	/**
	 * A callback that is called when the user finishes selecting items.
	 */
	onFinish: ( items: string[] ) => void;

	/**
	 * The label for the picker.
	 */
	label: string;

	// DataViewsContext props
	view: View;
	onChangeView: ( view: View ) => void;
	data: Item[];
	fields: Field< Item >[];
	paginationInfo: {
		totalItems: number;
		totalPages: number;
	};
	selection?: string[];
	onChangeSelection?: SetSelection;
	getItemId: ( item: Item ) => string;
	defaultLayouts: SupportedLayouts;
};

const isItemClickable = () => true;

export default function DataPicker< Item >( {
	multiple = false,
	onFinish,
	label,
	view,
	onChangeView,
	data,
	fields,
	paginationInfo,
	selection,
	onChangeSelection,
	getItemId,
	defaultLayouts,
}: DataPickerProps< Item > ) {
	const containerRef = useRef< HTMLDivElement | null >( null );
	const [ containerWidth, setContainerWidth ] = useState( 0 );
	const resizeObserverRef = useResizeObserver(
		( resizeObserverEntries: any ) => {
			setContainerWidth(
				resizeObserverEntries[ 0 ].borderBoxSize[ 0 ].inlineSize
			);
		},
		{ box: 'border-box' }
	);
	const [ selectionState, setSelectionState ] = useState< string[] >( [] );
	const isUncontrolled =
		selection === undefined || onChangeSelection === undefined;
	const _selection = isUncontrolled ? selectionState : selection;
	const [ openedFilter, setOpenedFilter ] = useState< string | null >( null );
	function setSelectionWithChange( value: SelectionOrUpdater ) {
		const newValue =
			typeof value === 'function' ? value( _selection ) : value;
		if ( isUncontrolled ) {
			setSelectionState( newValue );
		}
		if ( onChangeSelection ) {
			onChangeSelection( newValue );
		}
	}
	const _fields = useMemo( () => normalizeFields( fields ), [ fields ] );

	const onFinishWithSelection = useCallback( () => {
		onFinish( _selection );
	}, [ onFinish, _selection ] );

	const filters = useFilters( _fields, view );
	const [ isShowingFilter, setIsShowingFilter ] = useState< boolean >( () =>
		( filters || [] ).some( ( filter ) => filter.isPrimary )
	);

	return (
		<DataViewsContext.Provider
			value={ {
				view,
				onChangeView,
				fields: _fields,
				data,
				paginationInfo,
				selection: _selection,
				onChangeSelection: setSelectionWithChange,
				getItemId,
				defaultLayouts,
				isItemClickable,

				// props to provide
				filters,
				openedFilter,
				setOpenedFilter,
				containerWidth,
				containerRef: { current: null },
				isShowingFilter,
				setIsShowingFilter,
			} }
		>
			<div
				className="dataviews-wrapper"
				ref={ useMergeRefs( [ containerRef, resizeObserverRef ] ) }
			>
				<HStack
					alignment="top"
					justify="space-between"
					className="dataviews__view-actions"
					spacing={ 1 }
				>
					<HStack
						justify="start"
						expanded={ false }
						className="dataviews__search"
					>
						<DataViews.Search />
						<DataViews.FiltersToggle />
					</HStack>
				</HStack>
				{ isShowingFilter && (
					<DataViews.Filters className="dataviews-filters__container" />
				) }
				<DataPickerLayout multiple={ multiple } label={ label } />
				<DataPickerFooter
					paginationInfo={ paginationInfo }
					onFinish={ onFinishWithSelection }
				/>
			</div>
		</DataViewsContext.Provider>
	);
}

function DataPickerFooter( {
	paginationInfo,
	onFinish,
}: {
	paginationInfo: { totalItems: number; totalPages: number };
	onFinish: () => void;
} ) {
	const { totalItems, totalPages } = paginationInfo;
	if ( ! totalItems || ! totalPages || totalPages <= 1 ) {
		return null;
	}

	return (
		<HStack expanded={ false } justify="start" className="dataviews-footer">
			{ paginationInfo.totalPages > 1 && <DataViews.Pagination /> }
			<Button
				variant="primary"
				onClick={ onFinish }
				__next40pxDefaultSize
			>
				{ __( 'Finish selection' ) }
			</Button>
		</HStack>
	);
}

function DataPickerLayout( {
	multiple,
	label,
}: {
	multiple: boolean;
	label: string;
} ) {
	const {
		data,
		fields,
		getItemId,
		isLoading,
		view,
		onChangeView,
		selection,
		onChangeSelection,
		paginationInfo,
	} = useContext( DataViewsContext );

	const { totalItems } = paginationInfo;
	const currentPage = view.page ?? 1;
	const startPosition =
		currentPage === 1 || ! view.perPage
			? 1
			: ( currentPage - 1 ) * view.perPage + 1;

	if ( view.type === 'picker-grid' ) {
		return (
			<DataPickerGridLayout
				multiple={ multiple }
				label={ label }
				data={ data }
				getItemId={ getItemId }
				fields={ fields }
				isLoading={ isLoading }
				onChangeView={ onChangeView }
				view={ view }
				selection={ selection }
				onChangeSelection={ onChangeSelection }
				setSize={ totalItems }
				startPosition={ startPosition }
			/>
		);
	}

	return null;
}
