/**
 * WordPress dependencies
 */
import { __experimentalVStack as VStack } from '@wordpress/components';

/**
 * Internal dependencies
 */
import PreviewSizePicker from './preview-size-picker';
import InfiniteScrollToggle from './infinite-scroll-toggle';

export default function GridConfigOptions() {
	return (
		<VStack spacing={ 4 }>
			<PreviewSizePicker />
			<InfiniteScrollToggle />
		</VStack>
	);
}
